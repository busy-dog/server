import type { SQL } from 'drizzle-orm';
import { eq, or } from 'drizzle-orm';
import {
  char,
  index,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

import { isNullish, isString } from 'remeda';
import { v7 } from 'uuid';

import type { GithubUserInfo } from 'src/helpers';
import { compact, isNonEmptyArray, isScalar } from 'src/utils';

import { columns } from '../helpers';
import { db } from '../postgre';

const table = pgTable(
  'members',
  {
    id: char('id', { length: 36 }).primaryKey(),
    ...columns.person,
    status: varchar('status', { length: 31 }),
    appleId: varchar('apple_id', { length: 63 }),
    googleId: varchar('google_id', { length: 63 }),
    githubId: varchar('github_id', { length: 63 }),
    password: varchar('password', { length: 255 }),
    ...columns.otps,
    ...columns.owners,
    ...columns.timestamps,
  },
  (table) => [
    index('members_status_index').on(table.status),
    uniqueIndex('members_email_unique').on(table.email),
    uniqueIndex('members_mobile_unique').on(table.mobile),
  ],
);

export type MemberInfoModel = typeof table.$inferInsert;

export type MemberSelectModel = Partial<typeof table.$inferSelect>;

const schema = {
  select: createSelectSchema(table),
  insert: createInsertSchema(table),
  update: createUpdateSchema(table),
};

const exist = async ({
  id,
  email,
  mobile,
  googleId,
  githubId,
}: MemberSelectModel) =>
  isNonEmptyArray(
    await db.common
      .select()
      .from(table)
      .where(
        or(
          ...compact([
            isString(id) && eq(table.id, id),
            isString(email) && eq(table.email, email),
            isString(mobile) && eq(table.mobile, mobile),
            isScalar(googleId) && eq(table.googleId, googleId),
            isScalar(githubId) && eq(table.githubId, githubId),
          ]),
        )!,
      ),
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
  return db.common.insert(table).values(schema.insert.parse(value));
};

export const query = async (selector?: SQL) => {
  const rows = await db.common.select().from(table).where(selector);

  if (rows.length > 1) {
    throw new Error('Multiple users found');
  }
  if (rows.length === 0 || isNullish(rows[0])) {
    throw new Error('No user info provided');
  }
  return rows[0];
};

export const update = async (info: Partial<MemberInfoModel>, selector: SQL) => {
  return db.common.update(table).set(schema.update.parse(info)).where(selector);
};

export const members = {
  table,
  schema,
  exist,
  create,
  query,
  update,
};
