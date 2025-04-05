import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { validator } from 'hono/validator';

import { isString } from 'remeda';

import type { AppEnv } from 'src/helpers';
import { session } from 'src/helpers';
import { services } from 'src/services';
import { z } from 'zod';

const app = new Hono<AppEnv>();

const { github, users } = services;

/**
 * Github 授权回调 URI
 */
app.get(
  '/oauth',
  validator('query', (value) =>
    z
      .object({
        code: z.string({
          required_error: '"Code" must be required',
        }),
        state: z.string({
          required_error: '"State" must be required',
        }),
      })
      .parse(value),
  ),
  async ({ req, redirect }) => {
    const { code } = req.valid('query');
    const res = await github.token(code);
    const { access_token: token } = res;

    if (!isString(token)) {
      throw new Error('Invalid GitHub OAuth response: Missing access token');
    }

    const info = await github.userinfo(token);
    const githubId = info.id.toString();

    const { exist, create, query, table } = users;

    if (await exist({ githubId })) {
      // 如果用户已存在，则更新用户信息
    } else {
      await create({ github: info });
    }

    const { state } = req.valid('query');
    const { id } = await query(eq(table.githubId, githubId));
    await session.set(state, { id });
    return redirect('http://127.0.0.1:8080');
  },
);

export { app };
