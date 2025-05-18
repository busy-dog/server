import Driver, { fetch2curl } from '@busymango/fetch-driver';

import { compact, report } from 'src/utils';

const { drive, request } = new Driver([
  async (ctx, next) => {
    const { api, options } = ctx;
    report.info('\u0020' + fetch2curl(api, options), { name: 'driver' });
    await next();
    const { response, body } = ctx;
    const directory = {
      status: response?.status,
      body: JSON.stringify(body),
      data: JSON.stringify(options.body),
      headers: JSON.stringify(response?.headers?.entries()),
    };
    report.info(api, { name: 'driver', directory });
  },
]);

/**
 * Github Restful API 错误响应体
 */
export interface GithubErrorBody {
  documentation_url: string;
  message: string;
  status: '404';
}

export { drive, request };

/**
 * Github Restful API 驱动
 * @param api - API 路径
 * @param options - 选项
 * @returns Github Restful API 响应
 */
export const github = <T>(
  api: string,
  {
    data,
    token,
    method = 'GET',
  }: {
    token?: string;
    data?: object;
    method?: string;
  },
) =>
  drive<T | GithubErrorBody>({
    data,
    method,
    api: `https://api.github.com${api}`,
    headers: compact<[string, string]>([
      ['X-GitHub-Api-Version', '2022-11-28'],
      ['Accept', 'application/vnd.github+json'],
      token && ['Authorization', `Bearer ${token}`],
    ]) satisfies HeadersInit,
  });
