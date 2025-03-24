import { redis } from './ioredis';
import { db } from './postgre';

export const destroy = async () => {
  redis.forEach((node) => node.quit());
  await db.common.$client.removeAllListeners();
};

export * from './ioredis';
export * from './postgre';
