/**
 * @docs https://github.com/kelektiv/node-cron
 */
import type { Hono } from 'hono';

import { CronJob } from 'cron';

import { services } from 'src/services';

const start = () => {
  const { TZ } = process.env;
  const { health } = services;

  CronJob.from({
    /** 需要手动启动 */
    start: true,
    timeZone: TZ,
    runOnInit: true,
    // 每天从午夜（0点）开始，每隔三小时执行一次
    cronTime: '0 0 0/3 * * *',
    onTick: (_: Hono) => {
      health.iRedisChecker();
      health.iPostgresqlChecker();
    },
  }).start();
};

export const crons = {
  start,
};
