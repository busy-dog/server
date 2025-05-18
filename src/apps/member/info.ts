import { eq } from 'drizzle-orm';
import { isString } from 'remeda';

import { members } from 'src/databases';
import { respr, session } from 'src/helpers';

import { app } from './app';

app.get('/info', async (ctx) => {
  const res = await session.get(ctx);
  if (!isString(res?.id)) throw new Error('User not found');
  const info = await members.query(eq(members.table.id, res.id));
  return ctx.json(respr.decorator(info));
});
