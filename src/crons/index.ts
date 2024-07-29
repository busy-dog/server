/**
 * @docs https://github.com/kelektiv/node-cron
 */

import { Hono } from 'hono';
import { iHistoricalPriceSyncCronJob } from './historical.price.sync';

export const crons = (app: Hono) => {
  iHistoricalPriceSyncCronJob.start();
};
