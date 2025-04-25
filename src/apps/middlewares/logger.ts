import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

import { hex } from 'ansis';

import { colors } from 'src/constants';
import { report } from 'src/utils';

const humanize = (times: string[]) => {
  const [delimiter, separator] = [',', '.'];
  return times
    .map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter))
    .join(separator);
};

const time = (start: number) => {
  const delta = Date.now() - start;
  return humanize([
    delta < 1000 ? delta + 'ms' : Math.round(delta / 1000) + 's',
  ]);
};

const iColorStatus = (status: number) => {
  switch ((status / 100) | 0) {
    case 5: // error
      return hex(colors.red.coral)(status);
    case 4: // warning
      return hex(colors.apricot)(status);
    case 3: // redirect
      return hex(colors.cyan.turquoise)(status);
    case 2: // success
      return hex(colors.green.mint)(status);
    default:
      return status;
  }
};

/**
 * Logger Middleware for Hono.
 * @returns {MiddlewareHandler} The middleware handler function.
 */
export const iLogger = (): MiddlewareHandler => {
  const { electric: color } = colors.purple ?? {};

  return createMiddleware(async (ctx, next) => {
    const start = Date.now();
    const { url, raw } = ctx.req;
    const { method, headers, mode } = raw;
    const { pathname, hostname: name } = new URL(url);

    report.info(pathname, {
      color,
      name: `Incoming:${name}`,
      directory: {
        mode,
        method,
        body: raw.body,
        headers: JSON.stringify(headers.entries()),
      },
    });

    await next();

    const { status } = ctx.res;

    report.info(pathname, {
      color,
      name: `Outgoing:${name}`,
      directory: {
        elapsed: time(start),
        status: iColorStatus(status),
      },
    });
  });
};
