import { S2MS, assign } from '@busymango/utils';
import { iPublicDB, iRedisDB0 } from 'src/databases';
import { DistributedLock } from 'src/helpers';
import { iHistoricalPrices } from 'src/schemas';
import { iSvcBullionsPriceQuery } from './rapidapi';

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

  const creator = 'gold-price-live.p.rapidapi.com';

  const init = { creator, status: 1, unit: 'ounce' };

  type RowModel = typeof iHistoricalPrices.$inferInsert;

  const rows = [
    { code: 'gold', price: res.gold },
    { code: 'silver', price: res.silver },
  ].map((row) => assign<RowModel>(row, init));

  await iPublicDB.insert(iHistoricalPrices).values(rows);

  await iBullionsPriceSyncLock.release();
};
