import { boolean, date, timestamp, varchar } from 'drizzle-orm/pg-core';

export const person = {
  name: varchar('name', { length: 63 }).notNull(),
  birth: date('birth'),
  gender: varchar('gender', { length: 31 }),
  avatar: varchar('avatar', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  mobile: varchar('mobile', { length: 15 }).unique(),
};

export const otps = {
  otpSecret: varchar('otp_base32', { length: 255 }),
  otpAuthUri: varchar('otp_auth_uri', { length: 255 }),
  otpEnabled: boolean('otp_enabled').default(false),
  otpVerified: boolean('otp_verified').default(false),
};

export const owners = {
  creator: varchar('creator', { length: 36 }),
  updater: varchar('updater', { length: 36 }),
};

export const timestamps = {
  deleteAt: timestamp('delete_at'),
  updateAt: timestamp('update_at'),
  createAt: timestamp('create_at').defaultNow().notNull(),
};
