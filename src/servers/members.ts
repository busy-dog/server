import { v7 } from 'uuid';

import { isNullish, isString } from 'remeda';

import { eq, or } from 'drizzle-orm';
import type { MemberInfoModel, MemberSelectModel } from 'src/databases';
import { tables } from 'src/databases';
import { compact, isScalar } from 'src/utils';

import type { GithubUserInfo } from './github';
import { iServer } from './helpers';

const { members: table } = tables;

const server = iServer(table);

export const exist = async ({
  id,
  email,
  mobile,
  googleId,
  githubId,
}: MemberSelectModel) =>
  server.exist(
    or(
      ...compact([
        isString(id) && eq(table.id, id),
        isString(email) && eq(table.email, email),
        isString(mobile) && eq(table.mobile, mobile),
        isScalar(googleId) && eq(table.googleId, googleId.toString()),
        isScalar(githubId) && eq(table.githubId, githubId.toString()),
      ]),
    )!,
  );

export const create = async ({
  row,
  github,
}: {
  row?: MemberInfoModel;
  github?: GithubUserInfo;
}) => {
  const value = (() => {
    if (row) return row;
    if (github)
      return {
        id: v7(),
        status: 'active',
        creator: 'github',
        name: github.name ?? github.login,
        email: github.email ?? null,
        mobile: github.login ?? null,
        avatar: github.avatar_url ?? null,
        githubId: github.id?.toString() ?? null,
      };
  })();

  if (isNullish(value)) {
    throw new Error('No user info provided');
  }
  return server.create(value);
};

export const query = server.query;

export const update = server.update;
