import Driver from '@busymango/fetch-driver';
import { compact } from '@busymango/utils';

export const { drive, request } = new Driver([]);

/**
 * Github Restful API 错误响应体
 */
export interface GithubErrorBody {
  documentation_url: string;
  message: string;
  status: '404';
}

/**
 * Github Restful API 驱动
 * @param api - API 路径
 * @param options - 选项
 * @returns Github Restful API 响应
 */
export const iGithubDrive = <T>(
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
