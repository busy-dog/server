import type { Context } from 'hono';
import { sign, verify } from 'hono/jwt';

import { randomBytes } from 'crypto';
import { isString } from 'remeda';

import { redis } from 'src/databases';
import { session } from 'src/helpers';
import { aes } from 'src/utils';

/**
 * 获取 JWT secret
 * 密钥轮换（Rotation）30天
 * 生成新密钥：定期生成一个新的密钥，并保存在 Redis 中。
 * TODO 多密钥共存：保留旧密钥和新密钥一段时间。验证 JWT 时，先尝试使用当前密钥验证，如果失败，则尝试使用旧密钥进行验证。
 */
export const secret = async () => {
  const key = 'jwt.secret';
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
 * 生成 JWT token
 * @param ctx 上下文
 * @param expires 过期时间
 * @returns JWT token
 */
export const token = async (
  ctx: Context,
  {
    expires,
  }: {
    expires: Date;
  },
) =>
  sign(
    {
      id: await session.id(ctx),
      exp: expires.getTime() / 1000,
    },
    await secret(),
    'ES256',
  );

  
/**
 * 生成 JWT token
 * @param ctx 上下文
 * @param expires 过期时间
 * @returns JWT token
 */
export const isVaildJwt = async (
  jwt?: string,
) => {
  if (isString(jwt)) {
    try {
      const key = await secret();
      await verify(jwt, key, 'ES256');
      return true;
    } catch (_) {
      return false;
    }
  }
}
