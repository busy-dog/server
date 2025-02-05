import type { Hono } from 'hono';
import type { Context } from 'hono';
import { validator } from 'hono/validator';

import { isNil, isString } from '@busymango/is-esm';
import { authenticator } from 'otplib';

import { SERVER_NAME } from 'src/constants';
import { decorator, report, session } from 'src/helpers';
import type { UserInfoModel } from 'src/schemas';
import { services } from 'src/services';

export const register = (app: Hono) => {
  const issuer = SERVER_NAME;
  const { users } = services;

  const handler = async <T>(
    id: string,
    ctx: Context,
    func: (info: UserInfoModel) => Promise<T | void>,
  ) => {
    const { json } = ctx;
    try {
      const res = await func(await users.info({ id }));
      return json(decorator(res ?? (await users.info({ id }))));
    } catch (error) {
      report.error(error);
      return json(decorator(error));
    }
  };

  const middleware = {
    json: validator('json', ({ token }) => {
      if (!isString(token)) throw new Error('Token is required');
      return { token };
    }),
    cookie: validator('cookie', async (_, ctx) => {
      const { json } = ctx;
      const { id } = (await session.get(ctx)) ?? {};
      const error = new Error('No user with that email exists');

      if (isNil(id)) {
        return json(decorator(error), 401);
      }

      if (!users.exist({ id })) {
        return json(decorator(error), 401);
      }

      return { id };
    }),
  };

  /** 生成OTP密钥 */
  app.post('/otp/generate', middleware.cookie, async (ctx) => {
    const { req } = ctx;
    const { id } = req.valid('cookie');
    return await handler(id, ctx, async ({ name }) => {
      const secret = authenticator.generateSecret();
      const uri = authenticator.keyuri(name, issuer, secret);
      await users.update(id, { otpAuthUri: uri, otpSecret: secret });
    });
  });

  app.post(
    '/otp/verify',
    middleware.json,
    middleware.cookie,
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
          if (isNil(otpSecret)) throw new Error('OTP secret is not set');
          const delta = authenticator.verify({ token, secret: otpSecret });
          if (delta !== true) throw new Error('OTP token is invalid');
          if (!otpVerified) await users.update(id, { otpVerified: true });
          return json(decorator(await users.info({ id })));
        },
      );
    },
  );

  app.post('/otp/disabled', middleware.cookie, async (ctx) => {
    const { json } = ctx;
    const { id } = ctx.req.valid('cookie');
    return await handler(id, ctx, async () => {
      await users.update(id, { otpEnabled: false });
      return json(decorator(await users.info({ id })));
    });
  });
};
