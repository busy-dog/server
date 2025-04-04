import { eq } from 'drizzle-orm';
import type { Hono } from 'hono';
import { validator } from 'hono/validator';

import { isError, isString } from 'remeda';

import { decorator, report, session } from 'src/helpers';
import { services } from 'src/services';
import { z } from 'zod';

export const register = (app: Hono) => {
  const { github, users } = services;

  /**
   * Github 授权回调 URI
   */
  app.get(
    '/github/oauth',
    validator('query', (value, ctx) => {
      try {
        const { code, state } = z
          .object({
            code: z.string({
              required_error: '"Code" must be required',
            }),
            state: z.string({
              required_error: '"State" must be required',
            }),
          })
          .parse(value);
        return { code, state };
      } catch (error) {
        return ctx.json(decorator(error), 400);
      }
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
        const { id } = await users.query((instance, table) =>
          instance.where(eq(table.githubId, githubId)),
        );
        await session.set(state, { id });
        return redirect('http://127.0.0.1:8080');
      } catch (error) {
        report.error(error);
        const msg = isError(error) ? error.message : '';
        return redirect('http://127.0.0.1:8080?error=' + msg);
      }
    },
  );
};
