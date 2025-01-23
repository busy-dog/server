import { hex } from 'ansis';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { colors } from 'src/constants';

export interface DistributedLockParams {
  ttl?: number;
}

export class DistributedLock {
  key: string;

  id = nanoid();

  private ttl = 10000;

  private redis: Redis;

  private interval: NodeJS.Timeout | null = null;

  constructor(key: string, redis: Redis, { ttl }: DistributedLockParams = {}) {
    this.key = key;
    this.redis = redis;
    if (ttl) this.ttl = ttl;
  }

  private msg = (text: string) => {
    const { id, key } = this;
    const params = new URLSearchParams({ id, key });
    return `[DistributedLock: ${params.toString()}] ${text}`;
  };

  private info = (text: string) =>
    console.info(hex(colors.amber)(this.msg(text)));

  private startAutoRenewal() {
    const { key, redis, ttl } = this;
    this.interval = setInterval(() => {
      redis.pexpire(key, ttl);
    }, ttl / 2);
  }

  acquire = async (): Promise<boolean> => {
    const { redis, key, id, ttl } = this;
    const isLocked = (await redis.set(key, id, 'PX', ttl, 'NX')) === 'OK';
    if (isLocked) {
      this.startAutoRenewal();
      this.info('Lock acquired');
    } else {
      throw new Error(this.msg('Lock is already acquired by another process'));
    }
    return isLocked;
  };

  release = async (): Promise<boolean> => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    const { redis, key, id } = this;

    const script = [
      'if redis.call("get", KEYS[1]) == ARGV[1] then',
      '  return redis.call("del", KEYS[1])',
      'else',
      '  return 0',
      'end',
    ].join('\n');

    const isReleased = (await redis.eval(script, 1, key, id)) === 1;

    if (isReleased) {
      this.info('Lock released');
    } else {
      throw new Error(this.msg('Lock release failed'));
    }
    return isReleased;
  };
}
