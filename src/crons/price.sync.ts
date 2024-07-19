import { CronJob } from 'cron';
import { iPriceSync } from 'src/controllers';

const { TIME_ZONE } = process.env;

export const iSyncPriceCronJob = CronJob.from({
  /** 需要手动启动 */
  start: false,
  timeZone: TIME_ZONE,
  // 每天从午夜（0点）开始，每隔三小时执行一次
  cronTime: '0 0 0/3 * * *',
  onTick: iPriceSync.iSyncBullions,
});
