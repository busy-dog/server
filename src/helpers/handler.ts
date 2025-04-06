import type { Context } from 'hono';
import { isError, isNullish, isString, join, map, merge, pipe } from 'remeda';
import { ensure } from 'src/utils';
import { ZodError } from 'zod';
import * as report from './report';

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
        map(({ message }) => message),
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
