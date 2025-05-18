import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';

import { isString, merge } from 'remeda';
import { v7 } from 'uuid';

import { COOKIE_PRIFIX, COOKIE_SESSION_NAME } from 'src/constants';
import { redis } from 'src/databases';
import { isNonEmptyString, report, safe } from 'src/utils';

import * as jwt from './jwt';

export interface SessionValue {
  id: string; // 用户ID
}

const SESSION_PREFIX = 'session';

export const name = [COOKIE_PRIFIX, COOKIE_SESSION_NAME].join('_');

export const id = async (ctx: Context) => {
  const current = getCookie(ctx, name);
  if (isNonEmptyString(current)) return current;
  const { jwt: code } = (await jwt.find(ctx)) ?? {};
  if (isNonEmptyString(code)) {
    const { id } = await jwt.verify(code);
    if (isNonEmptyString(id)) return id;
  }
  return create(ctx);
};

const over = async (ctx: Context | string) =>
  isString(ctx) ? ctx : await id(ctx);

/**
 * 获取 Session Value
 */
export const get = async (ctx: Context | string) => {
  const id = await over(ctx);
  const parse = safe(JSON.parse);
  const key = [SESSION_PREFIX, id].join(':');
  const string = await redis[0].get(key);
  return isString(string) ? (parse(string) as SessionValue) : null;
};

/**
 * 获取 Session Value
 */
export const getWithAuth = async (ctx: Context | string) => {
  const id = await over(ctx);
  const parse = safe(JSON.parse);
  const key = [SESSION_PREFIX, id].join(':');
  const string = await redis[0].get(key);
  if (!isString(string)) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  return parse(string) as SessionValue;
};

/**
 * 设置 Session Value
 */
export const set = async (
  ctx: Context | string,
  value: Partial<SessionValue>,
) => {
  const id = await over(ctx);
  const ex = 60 * 60 * 24 * 30; // 30 days
  const previous = (await get(ctx)) ?? {};
  const current = merge(previous, value);
  // 如果用户已经登录，则将当前SessionID添加到用户会话集合中
  if (isNonEmptyString(current?.id)) {
    const key = ['auth', current.id].join(':');
    await redis[0].multi().sadd(key, id).expire(key, ex).exec();
  }
  const string = JSON.stringify(merge(previous, value));
  return await redis[0].set(`${SESSION_PREFIX}:${id}`, string, 'EX', ex);
};

/**
 * 清除 Session ID
 */
export const clear = async (ctx: Context | string) => {
  const id = await over(ctx);
  const info = await get(ctx);
  // 如果用户已经登录，则将当前SessionID从用户会话集合中移除
  if (isNonEmptyString(info?.id)) {
    const key = ['auth', info.id].join(':');
    await redis[0].srem(key, id);
  }
  return await redis[0].del([SESSION_PREFIX, id].join(':'));
};

/**
 * 创建 Session ID
 */
export const create = (ctx: Context) => {
  const id = v7();
  setCookie(ctx, name, id);
  report.info(`Set cookie:${id}`, { name: 'session' });
  return id;
};

/**
 * 检查 Session ID 是否存在
 */
export const exist = async (ctx: Context) => {
  return isNonEmptyString(id(ctx));
};
