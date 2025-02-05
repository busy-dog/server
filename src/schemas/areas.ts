import {
  bigint,
  char,
  decimal,
  mediumint,
  mysqlTable,
  serial,
  tinyint,
  varchar,
} from 'drizzle-orm/mysql-core';

/**
 * 中国行政地区表
 * CHARSET=utf8mb3
 * ENGINE=MyISAM
 * AUTO_INCREMENT=758050
 */
const table = mysqlTable('area_cn_2023', {
  /** `id` mediumint unsigned NOT NULL AUTO_INCREMENT */
  id: serial('id').primaryKey(),
  /** 层级 */
  level: tinyint('level', { unsigned: true }).notNull(),
  /** 父级行政代码 KEY `idx_parent_code` (`parent_code`) USING BTREE */
  parentCode: bigint('parent_code', { mode: 'number', unsigned: true })
    .notNull()
    .default(0),
  /** 行政代码 UNIQUE KEY `uk_code` (`area_code`) USING BTREE */
  areaCode: bigint('area_code', { mode: 'number', unsigned: true })
    .unique('uk_code')
    .notNull()
    .default(0),
  /** mediumint(6) zerofill 邮政编码 */
  zipCode: mediumint('zip_code', { unsigned: true })
    .notNull()
    .default(0o000000),
  /** 区号 */
  cityCode: char('city_code', { length: 6 }).notNull().default(''),
  /** 名称 */
  name: varchar('name', { length: 50 }).notNull().default(''),
  /** 简称 */
  shortName: varchar('short_name', { length: 50 }).notNull().default(''),
  /** 组合名 */
  mergeName: varchar('merger_name', { length: 50 }).notNull().default(''),
  /** 拼音 */
  pinyin: varchar('pinyin', { length: 30 }).notNull().default(''),
  /** 经度 */
  lng: decimal('lng', { precision: 10, scale: 6 })
    .notNull()
    .default('0.000000'),
  /** 纬度 */
  lat: decimal('lat', { precision: 10, scale: 6 })
    .notNull()
    .default('0.000000'),
});

export const cn2023 = {
  table,
};
