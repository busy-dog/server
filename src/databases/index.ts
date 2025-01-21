import { hex } from 'ansis';
import type { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import { Redis } from 'ioredis';
import { format } from 'mysql2';
import { createPool } from 'mysql2/promise';

import { colors } from 'src/constants';
import { report } from 'src/helpers';

const {
  MYSQL_PUBLIC_HOST: host,
  MYSQL_PUBLIC_USER: user,
  MYSQL_PUBLIC_PASSWORD: password,
} = process.env;

export class AnsisLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    report.ansis(hex(colors.violet)(format(query, params)));
  }
}

export const iMySQLDBCommon = drizzle(
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

export const iRedisDB0 = new Redis({
  host: process.env.REDIS_PUBLIC_HOST,
  port: 6379,
  db: 0,
});
