import { isNullish } from 'remeda';

import type { SQL } from 'drizzle-orm';
import type {
  PgInsertValue,
  PgTable,
  PgUpdateSetSource,
  TableConfig,
} from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

import { db } from 'src/databases';
import { iSearchParams, isNonEmptyArray } from 'src/utils';

export const iServer = <T extends TableConfig = TableConfig>(
  table: PgTable<T>,
) => {
  const schema = {
    select: createSelectSchema(table),
    insert: createInsertSchema(table),
    update: createUpdateSchema(table),
  };

  type InfoModel = ReturnType<typeof schema.insert.parse>;

  const exist = async (selector?: SQL) =>
    isNonEmptyArray(await db.common.select().from(table).where(selector));

  const query = async (selector?: SQL) => {
    const rows = await db.common.select().from(table).where(selector);

    if (rows.length > 1) {
      throw new Error('Multiple users found');
    }
    if (rows.length === 0 || isNullish(rows[0])) {
      throw new Error('No user info provided');
    }
    return rows[0];
  };

  const isCreateRow = (info: InfoModel) => {
    const row = schema.insert.parse(info);
    return row as unknown as PgInsertValue<PgTable<T>, false>;
  };

  const create = async (info: InfoModel) => {
    const { common } = db;
    const row = isCreateRow(info);
    return common.insert(table).values(row);
  };

  const isUpdateRow = (info: Partial<InfoModel>) => {
    const row = schema.update.parse(info);
    return row as unknown as PgUpdateSetSource<PgTable<T>>;
  };

  const update = async (info: Partial<InfoModel>, selector: SQL) => {
    const row = isUpdateRow(info);
    return db.common.update(table).set(row).where(selector);
  };

  return {
    table,
    exist,
    query,
    create,
    update,
  };
};

export type IServer<T extends TableConfig = TableConfig> = ReturnType<
  typeof iServer<T>
>;

export const iSrc = (host: string) => (api: string, queries?: unknown) =>
  [`${host}${api}`, iSearchParams(queries)].join('?');
