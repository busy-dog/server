import { assign, S2MS } from '@busymango/utils';
import { iHistoricalPrices } from 'src/schemas';
import { iPublicDB, iRedisDB0 } from 'src/databases';
import { iPriceQuery } from 'src/services';
import { DistributedLock } from 'src/helpers';

const iLock = new DistributedLock('sync_bullions', iRedisDB0, {
  ttl: 30 * S2MS,
});

export const iSyncBullions = async () => {
  await iLock.acquire();

  type RowModel = typeof iHistoricalPrices.$inferInsert;

  const res = await iPriceQuery.iBullionsPriceQuery();

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

  await iLock.release();
};
