/**
 * @docs https://github.com/kelektiv/node-cron
 */

import type { Hono } from 'hono';
import { iHistoricalPriceSyncCronJob } from './historical.price.sync';

export const crons = (_: Hono) => {
  iHistoricalPriceSyncCronJob.start();
};
