import type { Context, ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { isError, isNullish, isString, join, map, merge, pipe } from 'remeda';
import { ZodError } from 'zod';

import { ensure, report } from 'src/utils';

import type { AppEnv } from 'src/apps';

const isZodError = (err: unknown): err is ZodError => {
  return err instanceof ZodError;
};

export const decorator = <T>(
  data: T,
  params: {
    ctx?: Context;
    name?: string;
    code?: number;
    message?: string;
  } = {},
) => {
  const { code = -1, message } = params;

  const { name, pathname } = (() => {
    const { ctx } = params;
    if (!isNullish(ctx)) {
      const { url } = ctx.req;
      const { pathname, hostname: name } = new URL(url);
      return { name: `Decorator:${name}`, pathname };
    }
    return { name: 'Decorator', pathname: undefined };
  })();

  const error = (() => {
    if (isZodError(data)) {
      return pipe(
        data.errors,
        map(({ path, message }) => `${path} is ${message}`),
        join(' & '),
      );
    }
    if (isError(data)) {
      return data.message;
    }
  })();

  !isString(error) &&
    report.info(JSON.stringify(data), {
      name,
      directory: { pathname },
    });

  return merge(
    {
      code,
      data: null,
      success: false,
      message: message ?? ensure(isString(error) && error),
    },
    ensure(
      !isError(data) && {
        data,
        code: 0,
        success: true,
      },
    ),
  );
};

/**
 * 全局错误处理
 * 详情见 https://hono.dev/docs/api/exception
 * @param err 错误对象
 * @param ctx 上下文对象
 * @returns 响应对象
 */
export const error: ErrorHandler<AppEnv> = (err, ctx) => {
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
