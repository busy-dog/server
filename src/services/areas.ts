import { db } from 'src/databases';
import { schemas } from 'src/schemas';

export const search = async () => {
  await db.common.select().from(schemas.cn2023.table);
};
