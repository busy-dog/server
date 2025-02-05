import {
  boolean,
  mysqlTable,
  smallint,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';

import { common } from './common';

const table = mysqlTable('dictionary', {
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
  ...common,
});

export const dictionary = {
  table,
};
