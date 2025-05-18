import type { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

import { isNumber, isString } from 'remeda';

import { redis } from 'src/databases';
import { session } from 'src/helpers';
import { report } from 'src/utils';

interface RateLimitConfig {
  /**
   * 配额：窗口期间允许的最大请求数。
   * 可以是限制本身的数字，也可以是解析请求并计算限制的中间件。
   */
  quota: number | ((c: Context) => Promise<number>);
  /**
   * 我们应该记住请求多长时间(窗口期)。
   * 默认为 `60000` 毫秒(= 1 分钟)。
   */
  window?: number;
}

interface RateLimitOptions extends RateLimitConfig {
  /**
   * 生成唯一标识符的方法(ip, user-agent, etc.)用来判断是否是同一个用户
   */
  keyGenerator?: (c: Context) => Promise<string | undefined>;
  /**
   *方法（中间件形式），用于确定此请求是否
   *
   * 是否计入客户配额。
   */
  skipCounting?: (c: Context, key: string) => Promise<boolean>;
  /**
   * 当客户端受到速率限制时，Hono 请求处理程序会发回响应。
   */
  handler?: (
    c: Context,
    next: Next,
    params: RateLimitConfig & { remaining: number },
  ) => void;
}

/**
 * Redis 速率限制中间件
 */
export const iRateLimit = (options: RateLimitOptions) => {
  const {
    quota,
    window = 60000,
    skipCounting,
    keyGenerator = async (ctx: Context) => {
      const { id } = (await session.get(ctx)) ?? {};
      const forwarded = ctx.req.header('x-forwarded-for');
      const identifier = id ?? forwarded ?? (await session.id(ctx));
      if (isString(identifier)) return ['api-rate', identifier].join(':');
    },
    handler = (_, __, { remaining }) => {
      const seconds = Math.ceil(remaining / 1000);
      const message = `Too many requests, Please try again after a ${seconds} seconds.`;
      throw new HTTPException(429, { message });
    },
  } = options;

  return createMiddleware(async (ctx: Context, next: Next) => {
    const key = await keyGenerator(ctx);

    if (!isString(key)) {
      report.warn(new Error('Skip counting because not key'), {
        name: 'RateLimit',
      });
      return await next();
    }

    if (await skipCounting?.(ctx, key)) {
      return await next();
    }

    const { count, remaining } = await (async () => {
      // 使用 Redis 的 multi 命令保证原子性
      // 启动事务 -> 获取当前计数 -> 获取 TTL -> 执行事务
      const multi = redis[0].multi().get(key).pttl(key);
      const [current, ttl] = (await multi.exec()) ?? [];
      const count = parseInt(current?.[1]?.toString() ?? '0');
      const remaining = parseInt(ttl?.[1]?.toString() ?? '0');
      return { count, remaining };
    })();

    const max = await (async () => {
      if (isNumber(quota)) return quota;
      return await quota(ctx);
    })();

    const reset = Math.ceil(remaining / 1000);
    ctx.header('RateLimit-Limit', max.toString());
    ctx.header('RateLimit-Reset', reset.toString());

    if (count >= max) {
      // 超出限制
      ctx.header('RateLimit-Remaining', '0');
      ctx.header('Retry-After', reset.toString());
      return await handler(ctx, next, { window, quota, remaining });
    }

    await (async () => {
      // 增加计数并设置过期时间
      const multi = redis[0].multi();
      multi.incr(key);
      count === 0 && multi.pexpire(key, window);
      await multi.exec();
      ctx.header('RateLimit-Remaining', (max - count - 1).toString());
    })();

    await next();
  });
};
