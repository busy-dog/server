import { desc } from 'drizzle-orm';
import { iPublicDB } from 'src/databases';
import { iCNArea2020 } from 'src/schemas';

export const iSvcCNArea2020Search = () =>
  iPublicDB
    .select()
    .from(iCNArea2020)
    .orderBy(desc(iCNArea2020.pinyin))
    .limit(1);
