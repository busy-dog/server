import type { Hono } from 'hono';
import { iPriceSync } from 'src/controllers';

export function register(app: Hono) {
  app.get('/', ({ text }) => text('Hello,World!'));
  app.get('/price-sync', async ({ text }) => {
    await iPriceSync.iSyncBullions();
    return text('Success');
  });
}
