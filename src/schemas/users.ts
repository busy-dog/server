import {
  boolean,
  char,
  date,
  index,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';

import { common } from './common';

const table = mysqlTable(
  'users',
  {
    id: char('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 63 }).notNull(),
    birth: date('birth'),
    gender: varchar('gender', { length: 31 }),
    avatar: varchar('avatar', { length: 255 }),
    password: varchar('password', { length: 255 }),
    email: varchar('email', { length: 255 }).unique(),
    mobile: varchar('mobile', { length: 15 }).unique(),
    role: varchar('role', { length: 31 }),
    status: varchar('status', { length: 31 }),
    githubId: varchar('github_id', { length: 63 }),
    googleId: varchar('google_id', { length: 63 }),
    otpSecret: varchar('otp_base32', { length: 255 }),
    otpAuthUri: varchar('otp_auth_uri', { length: 255 }),
    otpEnabled: boolean('otp_enabled').default(false),
    otpVerified: boolean('otp_verified').default(false),
    ...common,
  },
  (table) => [
    index('role_index').on(table.role),
    index('status_index').on(table.status),
    uniqueIndex('unique_email').on(table.email),
    uniqueIndex('unique_mobile').on(table.mobile),
  ],
);

export type UserInsertModel = typeof table.$inferInsert;

export type UserSelectModel = Partial<typeof table.$inferSelect>;

export type UserInfoModel = UserInsertModel & UserSelectModel;

export const users = {
  table,
  schema: {
    insert: createInsertSchema(table),
  },
};
