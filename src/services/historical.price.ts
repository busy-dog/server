import { and, desc, eq, inArray } from 'drizzle-orm';
import { compact } from '@busymango/utils';
import { iHistoricalPrices } from 'src/schemas';

import { iPublicDB } from 'src/databases';

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
