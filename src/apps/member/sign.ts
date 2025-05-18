import { setCookie } from 'hono/cookie';
import { validator } from 'hono/validator';

import { eq, or } from 'drizzle-orm';

import dayjs from 'dayjs';
import { authenticator } from 'otplib';
import { isString } from 'remeda';
import { v7 } from 'uuid';
import { z } from 'zod';

import { members } from 'src/databases';
import { captcha, jwt, respr, session } from 'src/helpers';
import { pcrypt } from 'src/utils';

import { middlewares } from '../middlewares';

import { app } from './app';

/**
 * 账户密码登录
 * SHA-256 + scrypt 双重加密
 * 随机盐值防止彩虹表攻击
 * timingSafeEqual 防止时序攻击
 * 支持多因素认证（MFA）
 * 使用 rate limiting 防止暴力攻击
 * JWT 密钥定期轮换（30天）
 * TODO: 考虑添加密码历史记录，防止重复使用旧密码
 * TODO: 设备指纹识别 会话并发控制 异常登录检测
 * TODO: 登录历史记录- 登录尝试（成功/失败）、密码重置
 * TODO: c.header('X-Frame-Options', 'DENY');
 * TODO: c.header('X-Content-Type-Options', 'nosniff');
 * TODO: c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
 */
app.post(
  '/signin',
  middlewares.iRateLimit({
    quota: 100,
    window: 10 * 60 * 1000, // 15 minutes
  }),
  validator('json', async (value) => {
    const data = z
      .object({
        mobile: z.string().optional(),
        mfaCode: z.string().optional(),
        email: z.string().email().optional(),
        password: z
          .string({
            required_error: '"Password" is required',
          })
          .regex(/^[a-f0-9]{64}$/i),
      })
      .parse(value);

    const account = data.mobile ?? data.email;
    if (!isString(account)) throw new Error('"Account" is required');

    const info = await members.query(
      or(eq(members.table.email, account), eq(members.table.mobile, account)),
    );
    if (!info) throw new Error('User not found');

    const { mfaCode: token } = data;
    const { otpSecret: secret, otpEnabled: enabled } = info;

    if (enabled && isString(secret)) {
      if (!isString(token)) {
        throw new Error('MFA code is required');
      }
      const delta = authenticator.verify({ token, secret });
      if (delta !== true) {
        throw new Error('Invalid MFA code');
      }
    }
    if (!isString(info.password)) {
      throw new Error('Password is not set');
    }
    if (!pcrypt.compare(data.password, info.password)) {
      throw new Error('Invalid password');
    }
    return info;
  }),
  async (ctx) => {
    await session.clear(ctx);
    const userinfo = await ctx.req.valid('json');
    const expires = dayjs().add(30, 'day').toDate(); // 30 天
    const token = await jwt.sign(ctx, { expires });
    await session.set(ctx, { id: userinfo.id });
    setCookie(ctx, 'jwt', token, { expires }); // 设置 cookie
    return ctx.json(respr.decorator({ token, userinfo }));
  },
);

/**
 * 登出（注销当前会话）
 */
app.get('/signout', async (ctx) => {
  await session.clear(ctx);
  return ctx.json(respr.decorator(null));
});

/**
 * 注册
 */
app.post(
  '/signup',
  validator('json', async (value) => {
    const { email, mobile, password, ...others } = z
      .object({
        name: z.string({
          required_error: '"Name" is required',
        }),
        email: z.string().email().optional(),
        mobile: z.string().optional(),
        password: z
          .string({
            required_error: '"Password" is required',
          })
          .regex(/^[a-f0-9]{64}$/i),
        captcha: z.string({
          required_error: '"Captcha" is required',
        }),
      })
      .parse(value);

    if (isString(email)) {
      if (await members.exist({ email })) {
        throw new Error('Email is already exists');
      }
    }

    if (isString(mobile)) {
      if (await members.exist({ mobile })) {
        throw new Error('Mobile is already exists');
      }
    }

    const isMatch = await captcha.isMatch({
      email,
      mobile,
      captcha: others.captcha,
    });
    // TODO
    if (!isMatch) throw new Error('Invalid captcha');

    const salt = pcrypt.createSalt();
    const hashed = pcrypt.createHash(password, salt);

    return {
      email,
      mobile,
      id: v7(),
      password: pcrypt.pack(hashed, salt),
      ...others,
    };
  }),
  async ({ req, json }) => {
    const row = req.valid('json');
    const res = await members.create({ row });
    return json(respr.decorator(res));
  },
);
