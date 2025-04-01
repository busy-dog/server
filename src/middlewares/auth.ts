import { bearerAuth } from 'hono/bearer-auth';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import { report, session } from 'src/helpers';
import { services } from 'src/services';

/**
 * 认证中间件
 * 支持 jwt、bearer、session认证
 * @returns
 */
export const iAuth = () => {
  const { isVaildJwt } = services.crypto;
  return createMiddleware(async (ctx, next) => {
    const { url } = ctx.req;
    const { pathname } = new URL(url);
    const res = await session.get(ctx);
    const api = pathname.replace('/api', '');
    const jwt = await getCookie(ctx, 'token');
    if (
      // 白名单
      api.startsWith('/github') ||
      api.startsWith('/signin') ||
      api.startsWith('/oauth2') ||
      api.startsWith('/captcha')
    ) {
      report.info(`Spik auth:${api}`, { name: 'Auth' });
      await next();
    } else if (res?.id || (await isVaildJwt(jwt))) {
      report.info(`Vaild Jwt:${api}`, { name: 'Auth' });
      await next();
    } else {
      const bearer = bearerAuth({
        verifyToken: async (token) => {
          return (await isVaildJwt(token)) ?? false;
        },
      });
      return bearer(ctx, next);
    }
  });
};
