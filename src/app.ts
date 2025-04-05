import { Hono } from 'hono';
import { cors } from 'hono/cors';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import type { AppEnv } from './helpers';
import { middlewares } from './middlewares';
import { iGithubApp, iOTPApp, iUserApp } from './routes';

const { TZ } = process.env;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ);

const app = new Hono<AppEnv>()
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
  .use('*', middlewares.iAuth())
  .use('*', middlewares.iLogger())
  .route('/otp', iOTPApp)
  .route('/user', iUserApp)
  .route('/github', iGithubApp);

export { app };
export type App = typeof app;
