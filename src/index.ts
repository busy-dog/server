/**
 * @dos https://hono.dev/
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { crons } from 'src/crons';
import { routes } from 'src/routes';
import { iServerLog } from 'src/helpers';
import { middlewares } from 'src/middlewares';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

const { PORT = '3000', HOST = '0.0.0.0' } = process.env;

const app = new Hono();

const server = serve({
  hostname: HOST,
  port: Number(PORT),
  fetch: app.fetch,
});

server.addListener('listening', () => {
  iServerLog(dayjs().toString());
  iServerLog(`Server is running at ${HOST}:${PORT}`);
  middlewares(app);
  routes(app);
  crons(app);
});

server.addListener('close', async () => {});
