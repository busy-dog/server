import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

import { isString } from '@busymango/is-esm';
import { parse } from '@busymango/utils';

import { COOKIE_PRIFIX, COOKIE_SESSION_NAME } from 'src/constants';
import { redis } from 'src/databases';
import type { GithubAuthorize } from 'src/services';

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
  return parse.json<SessionValue>(string) ?? null;
};

export const set = async (ctx: Context | string, value: SessionValue) => {
  const id = over(ctx);
  return id ? await redis[0].set(id, JSON.stringify(value)) : null;
};

export const clear = async (ctx: Context | string) => {
  const id = over(ctx);
  return id ? await redis[0].del(id) : null;
};
