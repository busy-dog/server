import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

import { isString } from '@busymango/is-esm';
import { parse } from '@busymango/utils';

import { COOKIE_PRIFIX, COOKIE_SESSION_NAME } from 'src/constants';
import { iRedisDB0 } from 'src/databases';

export interface SessionValue {}

export const name = [COOKIE_PRIFIX, COOKIE_SESSION_NAME].join('_');

const over = (ctx: Context | string) => {
  return isString(ctx) ? ctx : getCookie(ctx, name);
};

export const get = async (ctx: Context | string) => {
  const id = over(ctx);
  if (!isString(id)) return null;
  const string = await iRedisDB0.get(id);
  if (!isString(string)) return null;
  return parse.json<SessionValue>(string) ?? null;
};

export const del = async (ctx: Context | string, value: SessionValue) => {
  const id = over(ctx);
  return id ? await iRedisDB0.del(id, JSON.stringify(value)) : null;
};

export const set = async (ctx: Context | string, value: SessionValue) => {
  const id = over(ctx);
  return id ? await iRedisDB0.set(id, JSON.stringify(value)) : null;
};
