import { isNumber } from 'remeda';

import { db, redis } from 'src/databases';

import { report } from 'src/helpers';

export async function iRedisChecker() {
  try {
    const val = JSON.stringify(true);
    const isHealth = await redis[0].get('isHealth');
    if (isHealth !== val) {
      report.warn(new Error('Redis health checker is expired'));
    }
    const expire = 3600 * 3 + 60; // 3 hours 60 seconds
    await redis[0].set('isHealth', val, 'EX', expire);
    report.info('Redis connection is healthy');
  } catch (error) {
    report.error(error, { name: 'Error during Redis health check' });
  }
}

export async function iPostgresqlChecker() {
  try {
    const cmd = 'select 1';
    const res = await db.common.execute(cmd);
    if (isNumber(res.rowCount) && res.rowCount !== 1) {
      throw new Error(`can't execute \`${cmd}\``);
    }
    report.info('Postgresql connection is healthy');
  } catch (error) {
    report.error(error, { name: 'Postgresql health check failed' });
  }
}
