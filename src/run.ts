/**
 * @dos https://hono.dev/
 */

import { serve } from '@hono/node-server';
import dayjs from 'dayjs';

import { app } from './app';
import * as crons from './crons';
import * as error from './error';
import { report } from './helpers';

const { PORT, HOST } = process.env;

app.onError(error.handler);

const server = serve({
  hostname: HOST,
  fetch: app.fetch,
  port: Number(PORT),
});

server.addListener('listening', () => {
  report.info(dayjs.tz.guess());
  report.info(`Running at ${HOST}:${PORT}`);
  crons.start();
});

server.addListener('close', async () => {
  report.info(`Close server`);
});
