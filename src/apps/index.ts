import { Hono } from 'hono';

import { cors } from 'hono/cors';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { app as iGithubApp } from './github';
import { respr } from './helpers';
import { app as iMemberApp } from './member';
import { middlewares } from './middlewares';
import { app as iOTPApp } from './otp';
import { app as iSysUserApp } from './sysuser';
import { app as iTrainRecordApp } from './train-record';
import type { AppEnv } from './types';

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
  .route('/user', iSysUserApp)
  .route('/member', iMemberApp)
  .route('/github', iGithubApp)
  .route('/train-record', iTrainRecordApp);

export type App = typeof app;

app.onError(respr.error);

export { app };
