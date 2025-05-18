import type { SQL } from 'drizzle-orm';
import { eq, or } from 'drizzle-orm';
import {
  char,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

import { isNullish, isString } from 'remeda';

import { compact, isNonEmptyArray, isScalar } from 'src/utils';
import { columns } from '../helpers';
import { db } from '../postgre';

const table = pgTable(
  'train_record',
  {
    id: char('id', { length: 36 }).primaryKey(),
    s3Key: text('s3_key'), // S3存储路径
    fileSize: integer('file_size').notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    deviceId: varchar('device_id', { length: 64 }), // 上传设备标识
    memberId: char('member_id', { length: 36 }).notNull(), // 关联用户ID
    status: varchar('status', { length: 31 }), // 文件状态
    syncAt: timestamp('sync_at'), // 最后同步时间
    ...columns.owners,
    ...columns.timestamps,
  },
  (table) => [
    index('status_index').on(table.status),
    index('member_id_index').on(table.memberId),
    index('device_id_index').on(table.deviceId),
  ],
);

export type TrainRecordInfoModel = typeof table.$inferInsert;

export type TrainRecordSelectModel = Partial<typeof table.$inferSelect>;

const exist = async ({
  id,
  s3Key,
  deviceId,
  memberId,
  syncAt,
}: TrainRecordSelectModel) =>
  isNonEmptyArray(
    await db.common
      .select()
      .from(table)
      .where(
        or(
          ...compact([
            isString(id) && eq(table.id, id),
            isString(s3Key) && eq(table.s3Key, s3Key),
            isString(deviceId) && eq(table.deviceId, deviceId),
            isScalar(memberId) && eq(table.memberId, memberId),
            isScalar(syncAt) && eq(table.syncAt, syncAt),
          ]),
        )!,
      ),
  );

const schema = {
  select: createSelectSchema(table),
  insert: createInsertSchema(table),
  update: createUpdateSchema(table),
};

const create = (info: TrainRecordInfoModel) =>
  db.common
    .insert(table)
    .values(schema.insert.parse({ ...info, createAt: new Date() }));

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

const update = async (info: Partial<TrainRecordInfoModel>, selector: SQL) =>
  db.common
    .update(table)
    .set(
      schema.update.parse({
        updateAt: new Date(),
        ...info,
      }),
    )
    .where(selector);

export const trainRec = {
  exist,
  query,
  create,
  update,
  schema,
  table,
};
