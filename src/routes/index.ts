import type { Hono } from 'hono';
import { iCtlBullionsPriceInfo } from 'src/controllers';

export const routes = (app: Hono) => {
  iCtlBullionsPriceInfo('/api/bullions-price/info', app);
};
