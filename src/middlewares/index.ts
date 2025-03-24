import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import { nanoid } from 'nanoid';
import { isString } from 'remeda';

import { colors } from 'src/constants';
import { report, session } from 'src/helpers';

/**
 * 认证中间件
 * 支持 jwt、bearer、session认证
 * @returns
 */
export const iAuth = () => {
  return createMiddleware(async (ctx, next) => {
    const { url } = ctx.req;
    const { pathname } = new URL(url);
    const res = await session.get(ctx);
    const api = pathname.replace('/api', '');
    // const jwt = await getCookie(ctx, 'token');
    if (
      // await verify(jwt) ||
      res?.access_token ||
      api.startsWith('/github') ||
      api.startsWith('/signin')
    ) {
      await next();
    } else {
      await next();
      // return bearerAuth({ token: token ?? '' })(ctx, next);
    }
  });
};

export const iRequestsLogger = () => {
  const { electric: color } = colors.purple ?? {};

  return createMiddleware(async ({ req, res }, next) => {
    const { method, headers, mode, body } = req.raw;
    const { pathname, hostname: name } = new URL(req.url);

    const common = { name, color };

    report.info(pathname, {
      ...common,
      directory: {
        mode,
        body,
        method,
        headers: JSON.stringify(headers.entries()),
      },
    });

    await next();

    report.info(pathname, {
      ...common,
      directory: { status: res.status, body: JSON.stringify(res.body) },
    });
  });
};

export const iSessionHandler = () => {
  const { name } = session;
  return createMiddleware(async (ctx, next) => {
    if (!isString(getCookie(ctx, name))) {
      setCookie(ctx, name, nanoid());
    }
    await next();
  });
};

export const middlewares = {
  iAuth,
  iRequestsLogger,
  iSessionHandler,
};
