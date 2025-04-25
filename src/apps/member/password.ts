import { Hono } from 'hono';
import { validator } from 'hono/validator';

import { eq } from 'drizzle-orm';
import { isString } from 'remeda';
import { z } from 'zod';

import { tables } from 'src/databases';
import { svrs } from 'src/servers';
import { pcrypt } from 'src/utils';

import { respr, session } from '../helpers';
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

    const { email } = await svrs.members.query(eq(tables.members.id, id));
    if (!isString(email)) throw new Error('Plz bind email');
    const isMatch = await svrs.captcha.isMatch({ email, ...data });
    if (isMatch) return { id, ...data };
    throw new Error('Invalid captcha');
  }),
  async (ctx) => {
    const { req, json } = ctx;
    const salt = pcrypt.createSalt();
    const { password, id } = req.valid('json');
    const hashed = pcrypt.createHash(password, salt);
    const res = await svrs.members.update(
      {
        password: pcrypt.pack(hashed, salt),
      },
      eq(tables.members.id, id),
    );
    return json(respr.decorator(res));
  },
);
