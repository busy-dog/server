import { entries, reduce } from 'remeda';

import {
  type BuildSchema,
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

import type { PgTable } from 'drizzle-orm/pg-core';
import { dicts } from './dicts';
import { members } from './members';
import { users } from './users';

type Entries<T extends {}> = ReturnType<typeof entries<T>>;

type GetSchemas<T extends Array<[PropertyKey, PgTable]>> = {
  [P in T[number] as P[0]]: {
    select: BuildSchema<'select', P[1]['_']['columns'], undefined>;
    insert: BuildSchema<'insert', P[1]['_']['columns'], undefined>;
    update: BuildSchema<'update', P[1]['_']['columns'], undefined>;
  };
};

export const tables = {
  users,
  dicts,
  members,
};

export const schemas = reduce(
  (acc, [key, table]) => ({
    ...acc,
    [key]: {
      select: createSelectSchema(table),
      insert: createInsertSchema(table),
      update: createUpdateSchema(table),
    },
  }),
  {} as GetSchemas<Entries<typeof tables>>,
)(entries(tables));

export type * from './dicts';
export type * from './members';
export type * from './users';
