import { isString } from '@busymango/is-esm';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { nanoid } from 'nanoid';
import { crons } from './crons';
import { session } from './helpers';
import { register } from './routes';

const { TZ } = process.env;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ);

export const app = new Hono()
  .basePath('/api')
  .use(
    '*',
    cors({
      maxAge: 600,
      credentials: true,
      origin: (origin) => origin,
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    }),
  )
  .use(
    '*',
    createMiddleware(async (ctx, next) => {
      const { name } = session;
      const id = getCookie(ctx, name);
      if (!isString(id)) {
        setCookie(ctx, name, nanoid());
      }
      await next();
    }),
  );

crons(app);
register(app);
