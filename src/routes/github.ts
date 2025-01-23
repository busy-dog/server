import { isError, isString } from '@busymango/is-esm';
import type { Hono } from 'hono';
import { validator } from 'hono/validator';
import { decorator, report, session } from 'src/helpers';
import { github } from 'src/services';

export const register = (app: Hono) => {
  /** Github oauth redirect */
  app.get('/signin/:method', async (ctx) => {
    const method = ctx.req.param('method');
    if (method === 'github') {
      return ctx.redirect(await github.signin(ctx));
    }
    return ctx.json(decorator(new Error('Undefined signin method')), 400);
  });
  /** Github authorization callback uri */
  app.get(
    '/github/oauth',
    validator('query', (value, ctx) => {
      const { code } = value;
      if (!isString(code)) {
        return ctx.json(decorator(new Error('"Code" must be required')), 400);
      }
      return { code };
    }),
    async (ctx) => {
      try {
        await github.token(ctx);
        return ctx.redirect('http://127.0.0.1:8080');
      } catch (error) {
        const msg = isError(error) ? error.message : '';
        report.error(msg);
        return ctx.redirect('http://127.0.0.1:8080?error=' + msg);
      }
    },
  );
  /** Github userinfo */
  app.get('/github/userinfo', async (ctx) => {
    const { access_token } = (await session.get(ctx)) ?? {};
    if (!access_token) {
      return ctx.json(decorator(new Error('Github token not find')), 401);
    }
    return ctx.json(decorator(await github.userinfo(access_token)));
  });
};
