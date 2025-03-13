/**
 * @dos https://hono.dev/
 */

import { serve } from '@hono/node-server';
import dayjs from 'dayjs';

import { app } from './app';
import { report } from './helpers';

const { PORT, HOST } = process.env;

const server = serve({
  hostname: HOST,
  fetch: app.fetch,
  port: Number(PORT),
});

server.addListener('listening', () => {
  report.info(dayjs.tz.guess());
  report.info(`Running at ${HOST}:${PORT}`);
});

server.addListener('close', async () => {
  report.info(`Close server`);
});
