import { sql } from 'drizzle-orm';
import { datetime, varchar } from 'drizzle-orm/mysql-core';

export const common = {
  creator: varchar('creator', { length: 255 }),
  updater: varchar('updater', { length: 36 }),
  createAt: datetime('create_at').default(sql`CURRENT_TIMESTAMP`),
  updateAt: datetime('update_at').default(sql`CURRENT_TIMESTAMP`),
};
