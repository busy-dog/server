import { v7 } from 'uuid';

import { isNullish, isNumber, isString } from 'remeda';

import { eq, or } from 'drizzle-orm';

import { db } from 'src/databases';
import type {
  UserInfoModel,
  UserInsertModel,
  UserSelectModel,
} from 'src/schemas';
import { schemas } from 'src/schemas';
import { compact } from 'src/utils';

import type { GithubUserInfo } from './github';

type Scalar = string | number;

// type UserKeys = keyof UserSelectModel;

const isScalar = (value: unknown): value is Scalar =>
  isString(value) || isNumber(value);

const info = () => {
  const { common } = db;
  const { table } = schemas.users;
  return common.select().from(table);
};

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

export const query = async (
  selector: (
    instance: ReturnType<typeof info>,
    table: typeof schemas.users.table,
  ) => Promise<UserInfoModel[]>,
) => {
  const { table } = schemas.users;
  const rows = await selector(info(), table);

  if (rows.length > 1) {
    throw new Error('Multiple users found');
  }
  if (rows.length === 0 || isNullish(rows[0])) {
    throw new Error('No user info provided');
  }
  return rows[0];
};

export const queryById = async (id: string) =>
  query((instance, table) => instance.where(eq(table.id, id)));

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

  if (isNullish(value)) {
    throw new Error('No user info provided');
  }
  return common.insert(table).values(value);
};

export const update = async (id: string, row: Partial<UserInsertModel>) => {
  const { common } = db;
  const { table } = schemas.users;
  return common.update(table).set(row).where(eq(table.id, id));
};
