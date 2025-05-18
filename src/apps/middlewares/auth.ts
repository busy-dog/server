import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

import { isString } from 'remeda';

import { jwt, session } from 'src/helpers';
import { report } from 'src/utils';

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
    const { jwt: code } = (await jwt.find(ctx)) ?? {};
    if (
      // 白名单
      api.startsWith('/github') ||
      api.startsWith('/oauth2') ||
      api.startsWith('/captcha') ||
      api.startsWith('/user/oauth2') ||
      api.startsWith('/user/signin') ||
      api.startsWith('/member/signin')
    ) {
      report.info(`Spik auth:${api}`, { name: 'Auth' });
    } else if (res?.id) {
      report.info(`Vaild Session:${api}`, { name: 'Auth' });
    } else if (isString(code) && (await jwt.isVaildJwt(code))) {
      report.info(`Vaild jwt:${api}`, { name: 'Auth' });
    } else {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    await next();
  });
};
