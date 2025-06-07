import { boolean, pgTable, smallint, text, varchar } from 'drizzle-orm/pg-core';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { columns } from '../helpers';

export const table = pgTable('dictionary', {
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
  ...columns.owners,
  ...columns.timestamps,
});

export type DictInfoModel = typeof table.$inferInsert;

export type DictSelectModel = Partial<typeof table.$inferSelect>;

const schema = {
  select: createSelectSchema(table),
  insert: createInsertSchema(table),
  update: createUpdateSchema(table),
};

export const dicts = {
  table,
  schema,
};
