import {
  char,
  index,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

import { cols } from 'src/helpers';

export const users = pgTable(
  'users',
  {
    id: char('id', { length: 36 }).primaryKey(),
    ...cols.person,
    role: varchar('role', { length: 31 }),
    status: varchar('status', { length: 31 }),
    appleId: varchar('apple_id', { length: 63 }),
    githubId: varchar('github_id', { length: 63 }),
    googleId: varchar('google_id', { length: 63 }),
    password: varchar('password', { length: 255 }),
    ...cols.otps,
    ...cols.owners,
    ...cols.timestamps,
  },
  (table) => [
    index('users_role_index').on(table.role),
    index('users_status_index').on(table.status),
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_mobile_unique').on(table.mobile),
  ],
);

export type UserInfoModel = typeof users.$inferInsert;

export type UserSelectModel = Partial<typeof users.$inferSelect>;
