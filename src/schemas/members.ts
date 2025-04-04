import {
  boolean,
  char,
  date,
  index,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { cols } from 'src/helpers';

const table = pgTable(
  'members',
  {
    id: char('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 63 }).notNull(),
    birth: date('birth'),
    gender: varchar('gender', { length: 31 }),
    avatar: varchar('avatar', { length: 255 }),
    password: varchar('password', { length: 255 }),
    email: varchar('email', { length: 255 }).unique(),
    mobile: varchar('mobile', { length: 15 }).unique(),
    status: varchar('status', { length: 31 }),
    appleId: varchar('apple_id', { length: 63 }),
    googleId: varchar('google_id', { length: 63 }),
    otpSecret: varchar('otp_base32', { length: 255 }),
    otpAuthUri: varchar('otp_auth_uri', { length: 255 }),
    otpEnabled: boolean('otp_enabled').default(false),
    otpVerified: boolean('otp_verified').default(false),
    ...cols.owners,
    ...cols.timestamps,
  },
  (table) => [
    index('status_index').on(table.status),
    uniqueIndex('unique_email').on(table.email),
    uniqueIndex('unique_mobile').on(table.mobile),
  ],
);

export type MemberInsertModel = typeof table.$inferInsert;

export type MemberSelectModel = Partial<typeof table.$inferSelect>;

export type MemberInfoModel = MemberInsertModel & MemberSelectModel;

export const member = {
  table,
  schema: {
    insert: createInsertSchema(table),
  },
};
