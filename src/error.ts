import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { isError } from 'remeda';

import type { AppEnv } from './helpers';
import { decorator, report } from './helpers';

/**
 * 全局错误处理
 * 详情见 https://hono.dev/docs/api/exception
 * @param err 错误对象
 * @param ctx 上下文对象
 * @returns 响应对象
 */
export const handler: ErrorHandler<AppEnv> = (err, ctx) => {
  report.error(err);
  const res = decorator(err);
  if (err instanceof HTTPException) {
    if (err.res) {
      return err.getResponse();
    }
    return ctx.json(res, err.status);
  }
  return ctx.json(res, isError(err) ? 400 : 500);
};
