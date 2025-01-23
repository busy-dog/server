import type { Hono } from 'hono';
import { validator } from 'hono/validator';

import { isError, isString } from '@busymango/is-esm';

import { decorator, iGithubDrive, report, session } from 'src/helpers';
import { type GithubUserInfo, github } from 'src/services';

export const register = (app: Hono) => {
  /**
   * Github 授权重定向
   */
  app.get('/signin/:method', async (ctx) => {
    const method = ctx.req.param('method');

    if (method === 'github') {
      return ctx.redirect(await github.signin(ctx));
    }
    return ctx.json(decorator(new Error('Undefined signin method')), 400);
  });

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
    async (ctx) => {
      try {
        const { code, state } = ctx.req.valid('query');
        const res = await github.token(code);
        if (!isString(res.access_token)) {
          throw new Error(
            'Invalid GitHub OAuth response: Missing access token',
          );
        }
        await session.set(state, res);
        return ctx.redirect('http://127.0.0.1:8080');
      } catch (error) {
        const msg = isError(error) ? error.message : '';
        report.error(msg);
        return ctx.redirect('http://127.0.0.1:8080?error=' + msg);
      }
    },
  );

  /**
   * 获取 Github 用户信息
   */
  app.get('/github/userinfo', async (ctx) => {
    const { access_token: token } = (await session.get(ctx)) ?? {};
    if (!token) {
      return ctx.json(decorator(new Error('Github token not find')), 401);
    }
    return ctx.json(
      decorator(await iGithubDrive<GithubUserInfo>('/user', { token })),
    );
  });
};
