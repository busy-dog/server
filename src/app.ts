import { Hono } from 'hono';
import { cors } from 'hono/cors';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { crons } from './crons';
import { middlewares } from './middlewares';
import { register } from './routes';

const { TZ } = process.env;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ);

export const app = register(
  crons(
    new Hono()
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
      .use('*', middlewares.iLogger())
      .use('*', middlewares.iAuth())
      .use('*', middlewares.iSessionHandler()),
  ),
);
