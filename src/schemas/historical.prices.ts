import { sql } from 'drizzle-orm';
import {
  datetime,
  float,
  mysqlEnum,
  mysqlTable,
  serial,
  tinyint,
  varchar,
} from 'drizzle-orm/mysql-core';

/**
 * https://github.com/drizzle-team/drizzle-orm/issues/1840
 * TODO: Comments definitions;
 * TODO: CHARACTER SET definitions;
 * TODO: COLLATE definitions;
 */
export const iHistoricalPrices = mysqlTable('historical_prices', {
  id: serial('id').primaryKey(),
  /** 产品代码 */
  code: varchar('code', { length: 255 }),
  /** 计量单位 */
  unit: varchar('unit', { length: 127 }),
  /** 单位价格（美元）*/
  price: float('price').default(sql`(NULL)`),
  /** 数据状态(0:等待;1:就绪) */
  status: tinyint('status', { unsigned: true }).notNull().default(0),
  /** 数据是否有效 */
  valid: mysqlEnum('valid', ['1', '0']).notNull().default('1'),
  /** 创建人/数据来源(uuid、domain) */
  creator: varchar('creator', { length: 36 }),
  /** 创建时间 */
  create_at: datetime('create_at', { fsp: 6 }).default(
    sql`(current_timestamp)`,
  ),
  /** 更新人/更新来源(uuid、domain) */
  updater: varchar('updater', { length: 36 }),
  /** 更新时间 */
  update_at: datetime('update_at', { fsp: 6 }),
});
