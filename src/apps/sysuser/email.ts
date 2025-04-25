import { validator } from 'hono/validator';

import { eq } from 'drizzle-orm';
import { isString } from 'remeda';
import { z } from 'zod';

import { tables } from 'src/databases';
import { svrs } from 'src/servers';

import { respr, session } from '../helpers';
import { middlewares } from '../middlewares';

import { app } from './app';

/**
 * 发送邮箱验证码
 */
app.post(
  '/email/captcha',
  middlewares.iRateLimit({
    quota: 1,
    window: 1 * 60 * 1000, // 1 minutes
  }),
  validator('json', async (value) =>
    z
      .object({
        email: z
          .string({
            required_error: '"Email" is required',
          })
          .email({
            message: '"Email" must be a valid email',
          }),
      })
      .parse(value),
  ),
  async ({ req, json }) => {
    const data = req.valid('json');
    const res = await svrs.captcha.create(data);
    return json(respr.decorator(res));
  },
);

// 绑定邮箱
app.put(
  '/email/bind',
  validator('json', async (value) =>
    z
      .object({
        email: z.string().email(),
        captcha: z.string(),
      })
      .parse(value),
  ),
  async (ctx) => {
    const { req, json } = ctx;
    const data = req.valid('json');
    if (!(await svrs.captcha.isMatch(data))) {
      throw new Error('Invalid captcha');
    }
    const { email } = data;
    const { id } = (await session.get(ctx)) ?? {};
    if (!isString(id)) throw new Error('User not found');
    const res = await svrs.users.update({ email }, eq(tables.users.id, id));
    return json(respr.decorator(res));
  },
);
