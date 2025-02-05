import type { Hono } from 'hono';
import { validator } from 'hono/validator';

import { isError, isString } from '@busymango/is-esm';

import { decorator, report, session } from 'src/helpers';
import { services } from 'src/services';

export const register = (app: Hono) => {
  const { github, users } = services;

  /**
   * Github 授权回调 URI
   */
  app.get(
    '/github/oauth',
    validator('query', (value, ctx) => {
      const { code, state } = value;
      if (!isString(code)) {
        return ctx.json(decorator(new Error('"Code" must be required')), 400);
      }
      if (!isString(state)) {
        return ctx.json(
          decorator(
            new Error('"State" must be required, Plz check `github.signin`'),
          ),
          400,
        );
      }
      return { code, state };
    }),
    async ({ req, redirect }) => {
      try {
        const { code } = req.valid('query');
        const res = await github.token(code);
        const { access_token: token } = res;

        if (!isString(token)) {
          throw new Error(
            'Invalid GitHub OAuth response: Missing access token',
          );
        }

        const info = await github.userinfo(token);
        const githubId = info.id.toString();

        if (await users.exist({ githubId })) {
          // 如果用户已存在，则更新用户信息
        } else {
          await users.create({ github: info });
        }

        const { state } = req.valid('query');
        const { id } = await users.info({ githubId });
        await session.set(state, { ...res, id });
        return redirect('http://127.0.0.1:8080');
      } catch (error) {
        report.error(error);
        const msg = isError(error) ? error.message : '';
        return redirect('http://127.0.0.1:8080?error=' + msg);
      }
    },
  );

  /**
   * 获取 Github 用户信息
   */
  app.get(
    '/github/userinfo',
    validator('cookie', async (_, ctx) => {
      const res = await session.get(ctx);
      const { access_token: token } = res ?? {};
      if (isString(token)) return { token };
      return ctx.json(decorator(new Error('Github token not find')), 401);
    }),
    async ({ req, json }) => {
      const { token } = req.valid('cookie');
      return json(decorator(await github.userinfo(token)));
    },
  );
};
