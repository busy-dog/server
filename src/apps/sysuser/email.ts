import { validator } from 'hono/validator';

import { eq } from 'drizzle-orm';

import { isString } from 'remeda';
import { z } from 'zod';

import { users } from 'src/databases';
import { captcha, respr, session } from 'src/helpers';

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
    const res = await captcha.create(data);
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
    if (!(await captcha.isMatch(data))) {
      throw new Error('Invalid captcha');
    }
    const { email } = data;
    const { id } = (await session.get(ctx)) ?? {};
    if (!isString(id)) throw new Error('User not found');
    const res = await users.update({ email }, eq(users.table.id, id));
    return json(respr.decorator(res));
  },
);
