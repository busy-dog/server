import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { validator } from 'hono/validator';

import { eq } from 'drizzle-orm';
import { authenticator } from 'otplib';
import { isNullish, isString } from 'remeda';

import { SERVER_NAME } from 'src/constants';
import { tables } from 'src/databases';
import { svrs } from 'src/servers';

import { respr, session } from './helpers';
import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

const issuer = SERVER_NAME;

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

    if (!svrs.users.exist({ id })) {
      throw new HTTPException(401, { message });
    }

    return { id };
  }),
};

/** 生成OTP密钥 */
app.post('/generate', validators.cookie, async (ctx) => {
  const { req, json } = ctx;
  const { id } = req.valid('cookie');
  const secret = authenticator.generateSecret();
  const info = await svrs.users.query(eq(tables.users.id, id));
  const uri = authenticator.keyuri(info.name, issuer, secret);
  return json(
    respr.decorator(
      await svrs.users.update(
        { otpAuthUri: uri, otpSecret: secret },
        eq(tables.users.id, id),
      ),
    ),
  );
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
    const selector = eq(tables.users.id, id);
    const { otpEnabled, otpSecret, otpVerified } =
      await svrs.users.query(selector);
    if (otpEnabled !== true) throw new Error('OTP is not enabled');
    if (isNullish(otpSecret)) throw new Error('OTP secret is not set');

    const delta = authenticator.verify({ token, secret: otpSecret });
    if (delta !== true) throw new Error('OTP token is invalid');

    if (!otpVerified) {
      await svrs.users.update({ otpVerified: true }, selector);
    }
    return json(respr.decorator(await svrs.users.query(selector)));
  },
);

app.post('/disabled', validators.cookie, async (ctx) => {
  const { json } = ctx;
  const { id } = ctx.req.valid('cookie');
  const selector = eq(tables.users.id, id);
  await svrs.users.update({ otpEnabled: false }, selector);
  return json(respr.decorator(await svrs.users.query(selector)));
});

export { app };
