import type { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { Redis } from 'ioredis';

import { report } from 'src/helpers';

const {
  POSTGRESQL_HOST: host,
  POSTGRESQL_USER: user,
  POSTGRESQL_PASSWORD: password,
} = process.env;

export class AnsisLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    report.sql(query, params);
  }
}

const common = drizzle({
  logger: new AnsisLogger(),
  connection: {
    user,
    host,
    password,
    database: 'common',
    query_timeout: 60000,
    idleTimeoutMillis: 60000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
  }
});

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
  redis.forEach((e) => e.quit());
  await db.common.$client.removeAllListeners();
};
