import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { validator } from 'hono/validator';

import { isString } from 'remeda';
import { z } from 'zod';

import { users } from 'src/databases';
import { github, session } from 'src/helpers';

import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

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

    if (await users.exist({ githubId })) {
      // 如果用户已存在，则更新用户信息
    } else {
      await users.create({ github: info });
    }

    const { state } = req.valid('query');
    const { id } = await users.query(eq(users.table.githubId, githubId));
    await session.set(state, { id });
    return redirect('http://127.0.0.1:8080');
  },
);

export { app };
