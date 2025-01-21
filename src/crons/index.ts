/**
 * @docs https://github.com/kelektiv/node-cron
 */

import { CronJob } from 'cron';
import type { Hono } from 'hono';
import { health } from 'src/helpers';

const { TZ } = process.env;

export const iHealthCheckCronJob = CronJob.from({
  /** 需要手动启动 */
  start: false,
  timeZone: TZ,
  // 每天从午夜（0点）开始，每隔三小时执行一次
  cronTime: '0 0 0/3 * * *',
  onTick: health.iCheckMysql,
});

export const crons = (_: Hono) => {
  iHealthCheckCronJob.start();
};
