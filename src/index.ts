/**
 * @dos https://hono.dev/
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { crons } from 'src/crons';
import { routes } from 'src/routes';
import { iServerLog, iServerTime } from 'src/helpers';
import { middlewares } from 'src/middlewares';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

const { TZ, PORT, HOST } = process.env;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ);

const app = new Hono();

const server = serve({
  hostname: HOST,
  fetch: app.fetch,
  port: Number(PORT),
});

server.addListener('listening', () => {
  iServerLog(dayjs.tz.guess(), iServerTime());
  iServerLog(`Server is running at ${HOST}:${PORT}`);
  middlewares(app);
  routes(app);
  crons(app);
});

server.addListener('close', async () => {
  iServerLog(`Server close at ${iServerTime()}`);
});
