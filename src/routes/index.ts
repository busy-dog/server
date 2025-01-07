import type { Hono } from 'hono';
import { iCtlBullionsPriceInfo, iCtlRegionsSearch } from 'src/controllers';

export const routes = (app: Hono) => {
  iCtlRegionsSearch('/api/regions/search', app);
  iCtlBullionsPriceInfo('/api/bullions-price/info', app);
};
