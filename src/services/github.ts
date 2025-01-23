import { isString } from '@busymango/is-esm';
import { compact, iSearchParams } from '@busymango/utils';
import type { Context } from 'hono';
import { drive, session } from 'src/helpers';

const host = 'https://github.com';

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

export interface GithubUserInfo {
  // 用户登录名
  login: string;
  // 用户唯一 ID
  id: number;
  // 用户的节点 ID（Base64 编码）
  node_id: string;
  // 用户头像的 URL
  avatar_url: string;
  // Gravatar ID（可能为空字符串）
  gravatar_id: string;
  // 用户 API URL
  url: string;
  // 用户的 GitHub 页面 URL
  html_url: string;
  // 用户的粉丝列表 API URL
  followers_url: string;
  // 用户的关注列表 API URL（包含模板参数）
  following_url: string;
  // 用户的 Gist 列表 API URL（包含模板参数）
  gists_url: string;
  // 用户的加星项目 API URL（包含模板参数）
  starred_url: string;
  // 用户订阅的仓库 API URL
  subscriptions_url: string;
  // 用户所属组织的 API URL
  organizations_url: string;
  // 用户仓库列表的 API URL
  repos_url: string;
  // 用户事件 API URL（包含模板参数）
  events_url: string;
  // 用户接收的事件 API URL
  received_events_url: string;
  // 用户类型（例如 "User" 或 "Organization"）
  type: string;
  // 是否为站点管理员
  site_admin: boolean;
  // 用户的全名
  name?: string;
  // 用户所在公司
  company?: string;
  // 用户的博客或个人网站 URL
  blog?: string;
  // 用户所在位置
  location?: string;
  // 用户的公开电子邮件地址
  email?: string;
  // 用户是否可被雇佣
  hireable?: boolean;
  // 用户简介
  bio?: string;
  // 用户的 Twitter 用户名
  twitter_username?: string;
  // 用户的公开仓库数量
  public_repos: number;
  // 用户的公开 Gist 数量
  public_gists: number;
  // 用户的粉丝数量
  followers: number;
  // 用户关注的数量
  following: number;
  // 用户创建时间（ISO 8601 格式）
  created_at: string;
  // 用户最近更新时间（ISO 8601 格式）
  updated_at: string;
  // 用户的私有 Gist 数量
  private_gists?: number;
  // 用户总的私有仓库数量
  total_private_repos?: number;
  // 用户拥有的私有仓库数量
  owned_private_repos?: number;
  // 用户的磁盘使用量（单位：KB）
  disk_usage?: number;
  // 用户协作的仓库数量
  collaborators?: number;
  // 用户是否启用了两步验证
  two_factor_authentication: boolean;
  // 用户的订阅计划信息
  plan?: {
    // 计划名称
    name: string;
    // 分配的存储空间（单位：MB）
    space: number;
    // 允许的私有仓库数量
    private_repos: number;
    // 允许的协作者数量
    collaborators: number;
  };
}

const iGithubDrive = <T>(
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
  drive<T>({
    data,
    method,
    api: `https://api.github.com${api}`,
    headers: compact<[string, string]>([
      ['X-GitHub-Api-Version', '2022-11-28'],
      ['Accept', 'application/vnd.github+json'],
      token && ['Authorization', `Bearer ${token}`],
    ]) satisfies HeadersInit,
  });

export interface GithubErrorBody {
  documentation_url: string;
  message: string;
  status: '404';
}

export interface GithubAuthorize {
  scope: string;
  token_type: 'bearer';
  access_token: string;
}

/** */
export const token = async (
  ctx: Context<
    Record<string, never>,
    string,
    {
      in: Record<string, unknown>;
      out: {
        query: {
          code: string;
        };
      };
    }
  >,
) => {
  const { code } = ctx.req.valid('query');
  const api = host + '/login/oauth/access_token';
  const res = await drive.post<GithubAuthorize>(api, {
    code,
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
  });
  if (isString(res)) {
    throw new Error('Github error:' + res);
  }
  await session.set(code, res);
};

export const userinfo = async (token: string) =>
  iGithubDrive<GithubUserInfo>('/user', { token });

export const signin = async (ctx: Context) =>
  [
    `${host}/login/oauth/authorize`,
    iSearchParams({
      client_id: GITHUB_CLIENT_ID,
      state: session.get(ctx),
    }),
  ].join('?');
