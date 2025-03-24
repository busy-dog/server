import { timestamp, varchar } from 'drizzle-orm/pg-core';

import { toSnakeCaseKeys } from 'src/utils';

export const owners = {
  creator: varchar('creator', { length: 36 }),
  updater: varchar('updater', { length: 36 }),
};

export const timestamps = toSnakeCaseKeys({
  deleteAt: timestamp(),
  updateAt: timestamp(),
  createAt: timestamp().defaultNow().notNull(),
});
