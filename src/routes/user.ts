import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { validator } from 'hono/validator';

import dayjs from 'dayjs';
import { eq, or } from 'drizzle-orm';
import { authenticator } from 'otplib';
import { isString } from 'remeda';
import { z } from 'zod';

import type { AppEnv } from 'src/helpers';
import { decorator, jwt, session } from 'src/helpers';
import { middlewares } from 'src/middlewares';
import { iRateLimit } from 'src/middlewares/limit';
import { schemas } from 'src/schemas';
import { services } from 'src/services';
import { iSrc, isNonEmptyString, pcrypt, toSnakeCaseKeys } from 'src/utils';

const app = new Hono<AppEnv>();

const { captcha, users, github } = services;
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
      iSrc(
        {
          host: github.host,
          pathname: '/login/oauth/authorize',
        },
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

    const info = await users.query(
      or(eq(users.table.email, account), eq(users.table.mobile, account)),
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
    const userinfo = await ctx.req.valid('json');
    const expires = dayjs().add(30, 'day').toDate(); // 30 天
    const token = await jwt.sign(ctx, { expires });
    await session.set(ctx, { id: userinfo.id });
    setCookie(ctx, 'jwt', token, { expires }); // 设置 cookie
    return ctx.json(decorator({ token, userinfo }));
  },
);

/**
 * 登出（注销当前会话）
 */
app.get('/signout', async (ctx) => {
  await session.clear(ctx);
  return ctx.json(decorator(null));
});

/**
 * 发送邮箱验证码
 */
app.post(
  '/email/captcha',
  iRateLimit({
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
    return json(decorator(res));
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
    return json(decorator(res));
  },
);

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
    return json(decorator(res));
  },
);

/**
 * 注册
 */
app.post(
  '/signup',
  validator('json', async (value) => {
    const { email, mobile, captcha, password, ...others } = z
      .object({
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
      if (!(await users.exist({ email }))) {
        throw new Error('Email is already exists');
      }
    }

    if (isString(mobile)) {
      if (!(await users.exist({ mobile }))) {
        throw new Error('Mobile is already exists');
      }
    }

    const salt = pcrypt.createSalt();
    const hashed = pcrypt.createHash(password, salt);

    return schemas.users.insert.parse({
      email,
      mobile,
      password: pcrypt.pack(hashed, salt),
      ...others,
    });
  }),
  async ({ req, json }) => {
    const row = req.valid('json');
    const res = await users.create({ row });
    return json(decorator(res));
  },
);

app.get(
  '/info',
  iRateLimit({
    quota: 1,
    window: 10 * 60 * 1000, // 10 minutes
  }),
  async (ctx) => {
    const res = await session.get(ctx);
    if (!isString(res?.id)) throw new Error('User not found');
    const info = await users.query(eq(users.table.id, res.id));
    return ctx.json(decorator(info));
  },
);

export { app };
