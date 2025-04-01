import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

import { isString } from 'remeda';

import { COOKIE_PRIFIX, COOKIE_SESSION_NAME } from 'src/constants';
import { redis } from 'src/databases';
import type { GithubAuthorize } from 'src/services';
import { safe } from 'src/utils';

export interface SessionValue extends GithubAuthorize {
  id: string; // 用户ID
}

export const name = [COOKIE_PRIFIX, COOKIE_SESSION_NAME].join('_');

export const id = (ctx: Context) => getCookie(ctx, name);

const over = (ctx: Context | string) => (isString(ctx) ? ctx : id(ctx));

export const get = async (ctx: Context | string) => {
  const id = over(ctx);
  if (!isString(id)) return null;
  const string = await redis[0].get(id);
  if (!isString(string)) return null;
  return (safe(JSON.parse)(string) as SessionValue) ?? null;
};

export const set = async (ctx: Context | string, value: SessionValue) => {
  const id = over(ctx);
  const ex = 60 * 60 * 24 * 30; // 30 days
  return id ? await redis[0].set(id, JSON.stringify(value), 'EX', ex) : null;
};

export const clear = async (ctx: Context | string) => {
  const id = over(ctx);
  return id ? await redis[0].del(id) : null;
};
