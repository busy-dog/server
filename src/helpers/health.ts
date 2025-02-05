import { db, redis } from 'src/databases';

import * as report from './report';

export async function iRedisChecker() {
  try {
    const val = JSON.stringify(true);
    const res = await redis[0].get('health');
    if (res !== val) {
      report.warn(new Error('Redis health checker is expired'));
    }
    const expire = 3600 * 3 + 60; // 3 hours 60 seconds
    await redis[0].set('health', val, 'EX', expire);
    report.info('Redis connection is healthy');
  } catch (error) {
    report.error(error, { name: 'Error during Redis health check' });
  }
}

export async function iMysqlChecker() {
  try {
    const rows = await db.common.execute('SELECT 1');
    if (!(rows.length > 1)) {
      throw new Error("can't execute `SELECT 1`");
    }
    report.info('MySQL connection is healthy');
  } catch (error) {
    report.error(error, { name: 'Error during MySQL health check' });
  }
}
