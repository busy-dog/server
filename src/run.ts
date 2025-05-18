/**
 * @dos https://hono.dev/
 */

import { serve } from '@hono/node-server';

import dayjs from 'dayjs';

import { app } from 'src/apps';
import { crons } from 'src/crons';
import { report } from 'src/utils';
import { destroy } from './databases';

crons.start();

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

process.once('exit', () => {
  destroy();
  server.close();
});
