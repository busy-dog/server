/**
 * @docs https://github.com/kelektiv/node-cron
 */
import type { Hono } from 'hono';

import { CronJob } from 'cron';

import { health } from 'src/helpers';

const { TZ } = process.env;

export const iHealthCheckCronJob = CronJob.from({
  runOnInit: true,
  /** 需要手动启动 */
  start: false,
  timeZone: TZ,
  // 每天从午夜（0点）开始，每隔三小时执行一次
  cronTime: '0 0 0/3 * * *',
  onTick: (_: Hono) => {
    health.iRedisChecker();
    health.iPostgresqlChecker();
  },
});

export const start = () => {
  iHealthCheckCronJob.start();
};
