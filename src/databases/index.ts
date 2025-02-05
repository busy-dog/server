import type { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import { Redis } from 'ioredis';
import { createPool } from 'mysql2/promise';

import { report } from 'src/helpers';

const {
  MYSQL_PUBLIC_HOST: host,
  MYSQL_PUBLIC_USER: user,
  MYSQL_PUBLIC_PASSWORD: password,
} = process.env;

export class AnsisLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    report.mysql(query, params);
  }
}

const common = drizzle(
  createPool({
    host,
    user,
    password,
    database: 'common',
    maxIdle: 10, // 最大空闲连接数，默认等于 `connectionLimit`
    idleTimeout: 60000, // 空闲连接超时，以毫秒为单位，默认值为 60000 ms
    queueLimit: 0,
    connectionLimit: 10,
    enableKeepAlive: true,
    multipleStatements: true,
    waitForConnections: true,
    keepAliveInitialDelay: 0,
  }),
  { logger: new AnsisLogger() },
);

export const db = { common };

export const redis = [0].map(
  (db) =>
    new Redis({
      host: process.env.REDIS_PUBLIC_HOST,
      port: 6379,
      db,
    }),
);

export const destroy = async () => {
  await db.common.$client?.end();
  redis.forEach((e) => e.quit());
};
