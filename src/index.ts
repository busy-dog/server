/**
 * @dos https://hono.dev/
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { iSyncPriceCronJob } from 'src/crons';
import { register } from 'src/routes';
import { iServerLog } from './helpers';

const { PORT = '3000' } = process.env;

const { HOST: hostname = '0.0.0.0' } = process.env;

const port = parseInt(PORT, 10);

const app = new Hono();

(function effect() {
  register(app);
})();

const server = serve({ fetch: app.fetch, port, hostname });

server.addListener('listening', () => {
  iServerLog(`Server is running at ${hostname}:${port}`);
  iSyncPriceCronJob.start();
});

server.addListener('close', async () => {});
