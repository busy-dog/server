import type { DriveContext, DriveReport } from '@busymango/fetch-driver';
import Driver, { fetch2curl } from '@busymango/fetch-driver';
import { compact } from 'src/utils';

import * as report from './report';

class IDriveReport implements DriveReport {
  beforeFetch(context: DriveContext) {
    const { api, options } = context;
    report.info('\n\t' + fetch2curl(api, options), { name: 'driver' });
  }
  afterFetch(context: DriveContext) {
    const { api, response, options, body } = context;
    const directory = {
      status: response?.status,
      body: JSON.stringify(body),
      data: JSON.stringify(options.body),
      headers: JSON.stringify(response?.headers?.entries()),
    };
    report.info(api, { name: 'driver', directory });
  }
}

export const { drive, request } = new Driver({ report: new IDriveReport() });

/**
 * Github Restful API 错误响应体
 */
export interface GithubErrorBody {
  documentation_url: string;
  message: string;
  status: '404';
}

/**
 * 订制驱动
 */
export const drives = {
  /**
   * Github Restful API 驱动
   * @param api - API 路径
   * @param options - 选项
   * @returns Github Restful API 响应
   */
  github: <T>(
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
    }),
};
