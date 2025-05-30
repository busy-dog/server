import { validator } from 'hono/validator';

import { eq } from 'drizzle-orm';

import { isString } from 'remeda';
import { z } from 'zod';

import { users } from 'src/databases';
import { captcha, github, respr, session } from 'src/helpers';
import { isNonEmptyString, pcrypt, toSnakeCaseKeys } from 'src/utils';

import { app } from './app';

/**
 * 重置密码
 * TODO: 使用重置链接、通知用户密码已更改
 */
app.patch(
  '/password/reset',
  validator('json', async (value, ctx) => {
    const data = z
      .object({
        captcha: z.string(),
        password: z.string().regex(/^[a-f0-9]{64}$/i),
      })
      .parse(value);

    const { id } = (await session.get(ctx)) ?? {};

    if (!isString(id)) throw new Error('User not found');

    const { email } = await users.query(eq(users.table.id, id));
    if (!isString(email)) throw new Error('Plz bind email');
    const isMatch = await captcha.isMatch({ email, ...data });
    if (isMatch) return { id, ...data };
    throw new Error('Invalid captcha');
  }),
  async (ctx) => {
    const { req, json } = ctx;
    const salt = pcrypt.createSalt();
    const { password, id } = req.valid('json');
    const hashed = pcrypt.createHash(password, salt);
    const res = await users.update(
      { password: pcrypt.pack(hashed, salt) },
      eq(users.table.id, id),
    );
    return json(respr.decorator(res));
  },
);

/**
 * oatuh2 授权登录
 */
app.get('/oauth2/:method', async (ctx) => {
  const { req, redirect } = ctx;
  const method = req.param('method');
  if (method === 'github') {
    const sessionId = await (async () => {
      const id = await session.id(ctx);
      if (isNonEmptyString(id)) return id;
      return session.create(ctx);
    })();

    return await redirect(
      github.iGithubSrc(
        '/login/oauth/authorize',
        toSnakeCaseKeys({
          state: sessionId,
          clientId: github.clientId,
          // redirectUri,
        }),
      ),
    );
  }
  throw new Error('Invalid method');
});
