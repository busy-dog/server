import type { Context } from 'hono';
import { isError, isNullish, isObjectType, isString, merge } from 'remeda';
import { ensure, safe } from 'src/utils';
import { z } from 'zod';
import { report } from '.';

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

  const err = (() => {
    if (isError(data)) {
      report.error(data, { name });
      const { message } = data;
      const json = safe(JSON.parse)(message);
      if (isObjectType(json)) {
        // 解析Zod抛出的错误信息
        const res = z
          .array(
            z.object({
              code: z.string(),
              expected: z.string(),
              received: z.string(),
              path: z.array(z.string()),
              message: z.string(),
            }),
          )
          .safeParse(json);

        if (res.success) {
          return res.data.map(({ message }) => message).join(' & ');
        }

        return res.data;
      }

      return json ?? message;
    }
  })();

  if (!err) {
    report.info(JSON.stringify(data), {
      name,
      directory: {
        pathname,
      },
    });
  }

  return merge(
    {
      code,
      success: false,
      data: ensure(isObjectType(err) && err),
      message: message ?? ensure(isString(err) && err),
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
