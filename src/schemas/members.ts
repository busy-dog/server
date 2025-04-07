import {
  char,
  index,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

import { cols } from 'src/helpers';

export const members = pgTable(
  'members',
  {
    id: char('id', { length: 36 }).primaryKey(),
    ...cols.person,
    status: varchar('status', { length: 31 }),
    appleId: varchar('apple_id', { length: 63 }),
    googleId: varchar('google_id', { length: 63 }),
    githubId: varchar('github_id', { length: 63 }),
    password: varchar('password', { length: 255 }),
    ...cols.otps,
    ...cols.owners,
    ...cols.timestamps,
  },
  (table) => [
    index('members_status_index').on(table.status),
    uniqueIndex('members_email_unique').on(table.email),
    uniqueIndex('members_mobile_unique').on(table.mobile),
  ],
);

export type MemberInfoModel = typeof members.$inferInsert;

export type MemberSelectModel = Partial<typeof members.$inferSelect>;
