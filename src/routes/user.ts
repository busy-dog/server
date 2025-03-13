import dayjs from 'dayjs';
import type { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { validator } from 'hono/validator';

import { resHandler, session } from 'src/helpers';
import { schemas } from 'src/schemas';
import { services } from 'src/services';

export const register = (app: Hono) => {
  const { decorator } = resHandler;
  const { users, crypto, github } = services;
  /**
   * github 授权登录、账户登录
   */
  app.get('/signin/:method', async (ctx) => {
    const { req, redirect } = ctx;
    const method = req.param('method');
    if (method === 'github') {
      return redirect(
        await github.authorize(ctx, {
          redirect: 'http://127.0.0.1:3000',
        }),
      );
    }
    // TODO 从用户、（密码|OTP|验证码）匹配到用户 ID 存入 session
    const expires = dayjs().add(30, 'day').toDate(); // 30 天
    const token = await crypto.token(ctx, { expires }); // session id 生成 token
    setCookie(ctx, 'token', token, { expires }); // 设置 cookie
    return ctx.json(decorator({ token }));
  });

  /**
   * 登出（注销当前会话）
   */
  app.get('/signout', async (ctx) => {
    await session.clear(ctx);
    return ctx.json(decorator(null));
  });

  /**
   * 注册
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
      const res = req.valid('json');
      const row = await users.create(res);
      return json(decorator(row));
    },
  );
};

// password: crypto.createHash("sha256").update(password).digest("hex"),
