import type { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { validator } from 'hono/validator';

import dayjs from 'dayjs';
import { authenticator } from 'otplib';
import { isString } from 'remeda';
import { z } from 'zod';

import { resHandler, session } from 'src/helpers';
import { schemas } from 'src/schemas';
import { services } from 'src/services';

export const register = (app: Hono) => {
  const { decorator } = resHandler;
  const { users, crypto, github } = services;
  /**
   * oatuh2 授权登录、账户登录
   */
  app.get('/auth/:method', async (ctx) => {
    const { req, redirect, json } = ctx;
    const method = req.param('method');
    try {
      if (method === 'github') {
        return redirect(
          await github.authorize(ctx, {
            redirect: 'http://127.0.0.1:3000',
          }),
        );
      }
      throw new Error('Invalid method');
    } catch (error) {
      return json(decorator(error), 400);
    }
  });

  /**
   * 账户登录
   */
  app.post(
    '/signin',
    validator('json', async (value, { json }) => {
      const schema = z.object({
        mobile: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).max(20),
        mfaCode: z.string().optional(),
      });

      const data = schema.parse(value);
      const account = data.mobile || data.email;

      try {
        if (!isString(account)) {
          throw new Error('Account is required');
        }
        const info = await users.info({
          email: data.email,
          mobile: data.mobile,
        });
        if (!info) {
          return json(decorator(new Error('User not found')), 401);
        }
        const { mfaCode: token } = data;
        const { otpSecret: secret, otpEnabled: enabled } = info;
        if (enabled && isString(secret)) {
          if (!isString(token)) {
            throw new Error('MFA code is required');
          }
          const delta = authenticator.verify({ token, secret });
          if (delta !== true) {
            throw new Error('Invalid MFA code');
          }
        }
        if (info.password !== data.password) {
          return json(decorator(new Error('Invalid password')), 401);
        }
        return info;
      } catch (error) {
        return json(decorator(error), 400);
      }
    }),
    async (ctx) => {
      const userinfo = await ctx.req.valid('json');
      const expires = dayjs().add(30, 'day').toDate(); // 30 天
      const token = await crypto.token(ctx, { expires });
      setCookie(ctx, 'token', token, { expires }); // 设置 cookie
      return ctx.json(decorator({ token, userinfo }));
    },
  );

  /**
   * 登出（注销当前会话）
   */
  app.get('/signout', async (ctx) => {
    await session.clear(ctx);
    return ctx.json(decorator(null));
  });

  /**
   * 注册
   * 客户端提交的密码必须为hash值
   * password: crypto.createHash("sha256").update(password).digest("hex")
   */
  app.get(
    '/signup',
    validator('json', (value, { json }) => {
      try {
        const { schema } = schemas.users;
        return { row: schema.insert.parse(value) };
      } catch (error) {
        return json(decorator(error), 400);
      }
    }),
    async ({ req, json }) => {
      return json(decorator(await users.create(req.valid('json'))));
    },
  );
};
