import { snakeCase } from 'change-case';
import { timestamp, varchar } from 'drizzle-orm/pg-core';

export const owners = {
  creator: varchar('creator', { length: 36 }),
  updater: varchar('updater', { length: 36 }),
};

export const timestamps = {
  [snakeCase('deleteAt')]: timestamp(),
  [snakeCase('createAt')]: timestamp().defaultNow().notNull(),
  [snakeCase('updateAt')]: timestamp(),
};
