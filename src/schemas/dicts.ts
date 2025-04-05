import { boolean, pgTable, smallint, text, varchar } from 'drizzle-orm/pg-core';

import { cols } from 'src/helpers';

export const dicts = pgTable('dictionary', {
  path: varchar('path', { length: 255 }).primaryKey(),
  parent: varchar('parent', { length: 36 }),
  code: varchar('code', { length: 15 }),
  name: varchar('name', { length: 31 }),
  icon: varchar('icon', { length: 127 }),
  sort: smallint('sort').default(0),
  editable: boolean('editable').default(false),
  description: text('description'),
  vaild: boolean('vaild').default(true),
  remark: varchar('remark', { length: 255 }),
  ...cols.owners,
  ...cols.timestamps,
});

export type DictInfoModel = typeof dicts.$inferInsert;

export type DictSelectModel = Partial<typeof dicts.$inferSelect>;
