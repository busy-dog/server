import type { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { ensure, report } from 'src/utils';

const {
  POSTGRESQL_SSL: isSSL,
  POSTGRESQL_HOST: host,
  POSTGRESQL_USER: user,
  POSTGRESQL_PORT: port,
  POSTGRESQL_DATABASE: database,
  POSTGRESQL_PASSWORD: password,
} = process.env;

export class AnsisLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    report.sql(query, params, { name: 'Postgres' });
  }
}

const common = drizzle({
  logger: new AnsisLogger(),
  connection: {
    user,
    host,
    password,
    database,
    keepAlive: true,
    port: Number(port),
    query_timeout: 60000,
    idleTimeoutMillis: 60000,
    keepAliveInitialDelayMillis: 0,
    ssl: ensure(
      isSSL === 'true' && {
        rejectUnauthorized: false,
      },
    ),
  },
});

export const db = { common };
