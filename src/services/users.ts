import { v7 } from 'uuid';

import { isEmpty, isNil, isNumber, isString } from '@busymango/is-esm';
import { compact } from '@busymango/utils';
import { eq, or } from 'drizzle-orm';

import { db } from 'src/databases';
import type { UserInsertModel, UserSelectModel } from 'src/schemas';
import { schemas } from 'src/schemas';

import type { GithubUserInfo } from './github';

type Scalar = string | number;

type UserKeys = keyof UserSelectModel;

const isScalar = (value: unknown): value is Scalar =>
  isString(value) || isNumber(value);

export const exist = async ({
  id,
  email,
  mobile,
  googleId,
  githubId,
}: UserSelectModel) => {
  const { common } = db;
  const { table } = schemas.users;

  const rows = await common
    .select()
    .from(table)
    .where(
      or(
        ...compact([
          isString(id) && eq(table.id, id),
          isString(email) && eq(table.email, email),
          isString(mobile) && eq(table.mobile, mobile),
          isScalar(googleId) && eq(table.googleId, googleId.toString()),
          isScalar(githubId) && eq(table.githubId, githubId.toString()),
        ]),
      ),
    );

  return rows.length > 0;
};

export const info = async (
  selector: Pick<
    UserSelectModel,
    'id' | 'email' | 'mobile' | 'githubId' | 'googleId'
  >,
) => {
  const { common } = db;
  const { table } = schemas.users;
  type Entry = [UserKeys, Scalar];

  const entries = Object.entries(selector) as Entry[];

  if (isEmpty(entries)) {
    throw new Error('No user info provided');
  }

  const rows = await common
    .select()
    .from(table)
    .where(or(...compact(entries.map(([k, v]) => eq(table[k], v.toString())))));

  if (rows.length === 0) {
    throw new Error('No user info provided');
  }
  if (rows.length > 1) {
    throw new Error('Multiple users found');
  }
  return rows[0];
};

export const create = async ({
  row,
  github,
}: {
  row?: UserInsertModel;
  github?: GithubUserInfo;
}) => {
  const { common } = db;
  const { table } = schemas.users;
  const value = (() => {
    if (row) return row;
    if (github)
      return {
        id: v7(),
        role: 'user',
        status: 'active',
        creator: 'github',
        name: github.name ?? github.login,
        email: github.email ?? null,
        mobile: github.login ?? null,
        avatar: github.avatar_url ?? null,
        githubId: github.id?.toString() ?? null,
      };
  })();

  if (isNil(value)) {
    throw new Error('No user info provided');
  }
  return common.insert(table).values(value);
};

export const update = async (id: string, row: Partial<UserInsertModel>) => {
  const { common } = db;
  const { table } = schemas.users;
  return common.update(table).set(row).where(eq(table.id, id));
};
