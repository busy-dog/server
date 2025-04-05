// import { char, index, jsonb, pgTable, varchar } from 'drizzle-orm/pg-core';

// import { cols } from 'src/helpers';

// // 用户设备表
// export const devices = pgTable(
//   'devices',
//   {
//     id: char('id', { length: 36 }).primaryKey(),
//     name: varchar('name', { length: 255 }), // 设备名称/昵称
//     useragent: varchar('useragent', { length: 255 }), // 用户代理
//     fingerprint: varchar('fingerprint', { length: 255 }), // 设备指纹
//     about: jsonb('config'), // APP信息（用户设备使用的App信息）
//     config: jsonb('config'), // 设备配置
//     ...cols.timestamps,
//   },
//   (table) => [index('name_index').on(table.name)],
// );

// export type DeviceInfoModel = typeof devices.$inferInsert;

// export type DeviceSelectModel = Partial<typeof devices.$inferSelect>;
