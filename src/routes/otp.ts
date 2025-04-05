import { eq } from 'drizzle-orm';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { validator } from 'hono/validator';

import { authenticator } from 'otplib';
import { isNullish, isString } from 'remeda';

import { SERVER_NAME } from 'src/constants';
import type { AppEnv } from 'src/helpers';
import { decorator, session } from 'src/helpers';
import type { UserInfoModel } from 'src/schemas';
import { services } from 'src/services';

const app = new Hono<AppEnv>();

const issuer = SERVER_NAME;

const { users } = services;

const handler = async <T>(
  id: string,
  { json }: Context,
  func: (info: UserInfoModel) => Promise<T | void>,
) => {
  const selector = eq(users.table.id, id);
  const info = await users.query(selector);
  const res = (await func(info)) ?? info;
  return json(decorator(res));
};

const validators = {
  json: validator('json', ({ token }) => {
    if (!isString(token)) throw new Error('Token is required');
    return { token };
  }),
  cookie: validator('cookie', async (_, ctx) => {
    const { id } = (await session.get(ctx)) ?? {};
    const message = 'No user with that email exists';

    if (isNullish(id)) {
      throw new HTTPException(401, { message });
    }

    if (!users.exist({ id })) {
      throw new HTTPException(401, { message });
    }

    return { id };
  }),
};

/** 生成OTP密钥 */
app.post('/generate', validators.cookie, async (ctx) => {
  const { req } = ctx;
  const { id } = req.valid('cookie');
  return await handler(id, ctx, async ({ name }) => {
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(name, issuer, secret);
    await users.update(
      { otpAuthUri: uri, otpSecret: secret },
      eq(users.table.id, id),
    );
  });
});

app.post(
  '/verify',
  validators.json,
  validators.cookie,
  validator('json', ({ token }) => {
    if (!isString(token)) throw new Error('Token is required');
    return { token };
  }),
  async (ctx) => {
    const { json } = ctx;
    const { id } = ctx.req.valid('cookie');
    const { token } = ctx.req.valid('json');
    return await handler(
      id,
      ctx,
      async ({ otpEnabled, otpSecret, otpVerified }) => {
        if (otpEnabled !== true) throw new Error('OTP is not enabled');
        if (isNullish(otpSecret)) throw new Error('OTP secret is not set');

        const delta = authenticator.verify({ token, secret: otpSecret });
        if (delta !== true) throw new Error('OTP token is invalid');

        const selector = eq(users.table.id, id);
        if (!otpVerified) {
          await users.update({ otpVerified: true }, selector);
        }
        return json(decorator(await users.query(selector)));
      },
    );
  },
);

app.post('/disabled', validators.cookie, async (ctx) => {
  const { json } = ctx;
  const { id } = ctx.req.valid('cookie');
  return await handler(id, ctx, async () => {
    const selector = eq(users.table.id, id);
    await users.update({ otpEnabled: false }, selector);
    return json(decorator(await users.query(selector)));
  });
});

export { app };
