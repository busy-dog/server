import { isString } from 'remeda';

import { drive, drives } from 'src/helpers';
import { toSnakeCaseKeys } from 'src/utils';

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

export const host = 'https://github.com';

export const clientId = GITHUB_CLIENT_ID;

export const clientSecret = GITHUB_CLIENT_SECRET;

/**
 * Github 用户信息
 */
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

/**
 * Github normal error model
 */
export interface GithubErrorModel {
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface GithubAuthorize extends GithubErrorModel {
  scope: string;
  token_type: 'bearer';
  access_token: string;
}

/**
 * 获取 Github OAuth 令牌
 * @param code - 授权码
 * @returns Github OAuth 令牌
 */
export const token = async (code: string) => {
  const host = 'https://github.com';
  const api = '/login/oauth/access_token';
  try {
    const data = await drive.post<GithubAuthorize>(
      `${host}${api}`,
      toSnakeCaseKeys({
        code,
        clientId: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
      }),
      { headers: [['Accept', 'application/json']] },
    );
    if (isString(data)) {
      throw new Error(data);
    }
    if (data.error) {
      throw new Error(data.error_description);
    }
    return data;
  } catch (error) {
    throw new Error('GitHub OAuth error:' + error);
  }
};

export const userinfo = async (token: string) => {
  const res = await drives.github<GithubUserInfo>('/user', { token });
  if ('status' in res) throw new Error(res.message);
  return res;
};
