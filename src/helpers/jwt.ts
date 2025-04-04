import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import * as jwt from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { randomBytes } from 'node:crypto';
import { isError, isString } from 'remeda';

import { redis } from 'src/databases';
import { report, session } from 'src/helpers';
import { aes, isNonEmptyString } from 'src/utils';

export interface JWTBody extends JWTPayload {
  id: string;
}

/**
 * 获取 JWT secret
 * 密钥轮换（Rotation）30天
 * 生成新密钥：定期生成一个新的密钥，并保存在 Redis 中。
 * TODO: 考虑增加secret长度
 * TODO 多密钥共存：保留旧密钥和新密钥一段时间。验证 JWT 时，先尝试使用当前密钥验证，如果失败，则尝试使用旧密钥进行验证。
 */
export const secret = async () => {
  const key = 'secret:jwt';
  try {
    const res = await redis[0].get(key);
    if (!isString(res)) {
      throw new Error(`${key} is not set`);
    }
    return aes.decode(res);
  } catch (_) {
    const ex = 60 * 60 * 24 * 30; // 30 days
    const secret = randomBytes(16).toString('hex');
    await redis[0].set(key, aes.encode(secret), 'EX', ex);
    return secret;
  }
};

/**
 * 签发 JWT token
 * @param ctx 上下文
 * @param expires 过期时间
 * @returns JWT token
 */
export const sign = async (
  ctx: Context,
  {
    expires,
  }: {
    expires: Date;
  },
) =>
  jwt.sign(
    {
      id: await session.id(ctx),
      exp: expires.getTime() / 1000,
    } satisfies JWTBody,
    await secret(),
    'HS256',
  );

/**
 * 解码 JWT token
 * @param jwt JWT token
 * @returns 解码后的 JWT token
 */
export const verify = async (code: string) => {
  const key = await secret();
  const res = await jwt.verify(code, key, 'HS256');
  if (!isNonEmptyString(res?.id)) {
    throw new Error('JWT token invalid');
  }
  return res as JWTBody;
};

/**
 * 校验 JWT token
 * @param ctx 上下文
 * @param expires 过期时间
 * @returns JWT token
 */
export const isVaildJwt = async (code?: string) => {
  if (isString(code)) {
    try {
      await verify(code);
      return true;
    } catch (error) {
      if (isError(error)) {
        report.warn(error, { name: 'Auth' });
      }
      return false;
    }
  }
};

/**
 * 获取 JWT token
 * @param ctx 上下文
 * @returns JWT token
 */
export const find = async (ctx: Context) => {
  const jwt = await getCookie(ctx, 'jwt');
  if (isNonEmptyString(jwt)) return { jwt, type: 'cookie' };

  const token = ctx.req.header('Authorization');
  const regexp = new RegExp(`^Bearer([A-Za-z0-9._~+/-]+=*) *$`);
  if (isNonEmptyString(token)) {
    const jwt = regexp.exec(token)?.[1];
    if (isNonEmptyString(jwt)) return { jwt, type: 'header' };
  }

  return;
};
