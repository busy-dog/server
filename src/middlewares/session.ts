import { isNil, isString } from '@busymango/is-esm';
import type { Context, MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { iRedisDB0 } from 'src/databases';

export type SessionValue = string | number | Buffer | null;

export type SessionStore = {
  get: (key: string) => Promise<SessionValue>;
  del: (key: string) => Promise<SessionValue>;
  set: (key: string, val: SessionValue, expired?: number) => Promise<unknown>;
};

export interface SessionOptions {
  expired?: number;
  store?: SessionStore;
  name?: string | ((ctx: Context) => string);
  // store: Store | CookieStore
  // encryptionKey?: string;
  // cookieOptions?: CookieOptions,
}

export const session: (opts?: SessionOptions) => MiddlewareHandler = (
  opts = {},
) => {
  const {
    name = 'MANGO_SERVER_SESSION_ID',
    store = {
      get: iRedisDB0.get,
      del: iRedisDB0.del,
      set: async (key, val, expired = Infinity) => {
        if (isNil(val)) return await iRedisDB0.del(key);
        return await iRedisDB0.set(key, val, 'PX', expired);
      },
    },
  } = opts;

  return createMiddleware(async (ctx, next) => {
    const sid = getCookie(ctx, isString(name) ? name : name(ctx));

    ctx.set('echo', (anme: string) => 'chho' + anme);

    console.log(sid, store);

    await next();
  });
};
