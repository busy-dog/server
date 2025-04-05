// import { char, index, jsonb, pgTable, varchar } from 'drizzle-orm/pg-core';

// import { cols } from 'src/helpers';

// // 统一的设备表
// const table = pgTable(
//   'products',
//   {
//     id: char('id', { length: 36 }).primaryKey(),
//     name: varchar('name', { length: 255 }), // 设备名称/昵称
//     status: varchar('status', { length: 31 }).notNull().default('INACTIVE'),
//     serial: varchar('serial_number', { length: 63 }), // 序列号
//     model: varchar('device_model', { length: 63 }), // 产品型号
//     firmware: varchar('firmware', { length: 31 }), // 固件信息
//     // 扩展信息
//     config: jsonb('config'), // 设备配置
//     ownerId: char('owner_id', { length: 36 }), // 设备所有者（可能是机构）
//     ...cols.timestamps,
//   },
//   (table) => [index('devices_status_index').on(table.status)],
// );

// // 导出
// export const products = {
//   devices: {
//     table,
//     // schema: {
//     //   insert: createInsertSchema(devices),
//     // },
//   },
// };
