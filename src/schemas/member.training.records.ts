// import {
//   char,
//   index,
//   integer,
//   pgTable,
//   text,
//   timestamp,
//   varchar,
// } from 'drizzle-orm/pg-core';
// import { createInsertSchema } from 'drizzle-zod';

// import { cols } from 'src/helpers';

// const table = pgTable(
//   'member_training_records',
//   {
//     id: char('id', { length: 36 }).primaryKey(),
//     s3Key: text('s3_key').notNull(), // S3存储路径
//     fileSize: integer('file_size').notNull(),
//     fileName: varchar('file_name', { length: 255 }).notNull(),
//     deviceId: varchar('device_id', { length: 64 }), // 上传设备标识
//     memberId: char('member_id', { length: 36 }).notNull(), // 关联用户ID
//     status: varchar('status', { length: 31 }), // 文件状态
//     syncAt: timestamp('sync_at'), // 最后同步时间
//     ...cols.owners,
//     ...cols.timestamps,
//   },
//   (table) => [
//     index('status_index').on(table.status),
//     index('member_id_index').on(table.memberId),
//     index('device_id_index').on(table.deviceId),
//   ],
// );

// export type MemberTrainingRecordInsertModel = typeof table.$inferInsert;

// export type MemberTrainingRecordSelectModel = Partial<
//   typeof table.$inferSelect
// >;

// export type MemberTrainingRecordInfoModel = MemberTrainingRecordInsertModel &
//   MemberTrainingRecordSelectModel;

// export const memberTrainingRecords = {
//   table,
//   schema: {
//     insert: createInsertSchema(table),
//   },
// };
