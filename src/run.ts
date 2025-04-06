/**
 * @dos https://hono.dev/
 */

import { serve } from '@hono/node-server';
import dayjs from 'dayjs';

import { app } from './app';
import * as crons from './crons';
import * as error from './error';
import { report } from './helpers';

crons.start();

app.onError(error.handler);

const server = serve({
  fetch: app.fetch,
  hostname: process.env.HOST,
  port: Number(process.env.PORT),
});

server.addListener('listening', () => {
  report.info(dayjs.tz.guess());
  const { PORT, HOST } = process.env;
  report.info(`Running at ${HOST}:${PORT}`);
});

server.addListener('close', async () => {
  report.info(`Close server`);
});
