import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import { Hono } from 'hono';
import { crons } from './crons';
import { cors } from 'hono/cors';
import { session } from './helpers';
import { createMiddleware } from 'hono/factory';
import { getCookie, setCookie } from 'hono/cookie';
import { isString } from '@busymango/is-esm';
import { nanoid } from 'nanoid';

const { TZ } = process.env;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ);

export const app = new Hono().basePath('/api')
  .use(
    '*',
    cors({
      maxAge: 600,
      credentials: true,
      origin: (origin) => origin,
      allowMethods: [ 'GET', 'POST', 'OPTIONS'],
      allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    })
  ).use(
    '*',
    createMiddleware(
      async (ctx, next) => {
        const { name } = session;
        const id = getCookie(ctx, name);
        if (!isString(id)) {
          setCookie(ctx, name, nanoid());
        }
        await next();
      },
    )
  );

crons(app);
