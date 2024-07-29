import { assign, compact, S2MS } from '@busymango/utils';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { iPublicDB, iRedisDB0 } from 'src/databases';
import { DistributedLock } from 'src/helpers';
import { iHistoricalPrices } from 'src/schemas';
import { iSvcBullionsPriceQuery } from './rapidapi';

/**
 * 查询金银历史价格
 * 默认返回最近的一条记录
 */
export const iSvcBullionsPriceInfo = ({
  id,
  code,
}: {
  id?: number;
  code?: string[];
} = {}) =>
  iPublicDB
    .select()
    .from(iHistoricalPrices)
    .where(
      and(
        ...compact([
          id && eq(iHistoricalPrices.id, id),
          code && inArray(iHistoricalPrices.code, code),
        ]),
      ),
    )
    .orderBy(desc(iHistoricalPrices.create_at))
    .limit(1);

/**
 * 金银价格同步分布式锁
 */
const iBullionsPriceSyncLock = new DistributedLock('sync_bullions', iRedisDB0, {
  ttl: 30 * S2MS,
});

/**
 * 新增一条记录
 */
export const iSvcBullionsPriceSync = async () => {
  await iBullionsPriceSyncLock.acquire();

  const res = await iSvcBullionsPriceQuery();

  type RowModel = typeof iHistoricalPrices.$inferInsert;

  const source = [
    { code: 'gold', price: res.gold },
    { code: 'silver', price: res.silver },
  ];

  const rows = source.map((row) =>
    assign<RowModel>(row, {
      status: 1,
      unit: 'ounce',
      creator: 'gold-price-live.p.rapidapi.com',
    }),
  );

  await iPublicDB.insert(iHistoricalPrices).values(rows);

  await iBullionsPriceSyncLock.release();
};
