import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { AnsisLogger } from 'src/helpers';
import { Redis } from 'ioredis';

const {
  MYSQL_PUBLIC_USER: user,
  MYSQL_PUBLIC_HOST: host,
  MYSQL_PUBLIC_PASSWORD: password,
} = process.env;

const pool = createPool({
  host,
  user,
  password,
  database: 'basic',
  maxIdle: 10, // 最大空闲连接数，默认等于 `connectionLimit`
  idleTimeout: 60000, // 空闲连接超时，以毫秒为单位，默认值为 60000 ms
  queueLimit: 0,
  connectionLimit: 10,
  enableKeepAlive: true,
  multipleStatements: true,
  waitForConnections: true,
  keepAliveInitialDelay: 0,
});

export const iPublicDB = drizzle(pool, {
  logger: new AnsisLogger(),
});

export const iRedisDB0 = new Redis({
  host: process.env.REDIS_PUBLIC_HOST,
  port: 6379,
  db: 0, // Defaults to 0
});
