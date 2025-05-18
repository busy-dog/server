import { Hono } from 'hono';
import { validator } from 'hono/validator';

import { eq } from 'drizzle-orm';

import { isString } from 'remeda';
import { z } from 'zod';

import { members } from 'src/databases';
import { captcha, respr, session } from 'src/helpers';
import { pcrypt } from 'src/utils';

import type { AppEnv } from '../types';

const app = new Hono<AppEnv>();

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

    const { email } = await members.query(eq(members.table.id, id));
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
    const res = await members.update(
      {
        password: pcrypt.pack(hashed, salt),
      },
      eq(members.table.id, id),
    );
    return json(respr.decorator(res));
  },
);
