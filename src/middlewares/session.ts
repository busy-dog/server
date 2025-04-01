import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import { nanoid } from 'nanoid';
import { isString } from 'remeda';

import { report, session } from 'src/helpers';

export const iSessionHandler = () => {
  const { name } = session;
  return createMiddleware(async (ctx, next) => {
    if (!isString(getCookie(ctx, name))) {
      const id = nanoid();
      setCookie(ctx, name, id);
      report.info(`Set cookie:${id}`, { name: 'session' });
    }
    await next();
  });
};
