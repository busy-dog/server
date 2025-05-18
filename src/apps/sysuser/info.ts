import { eq } from 'drizzle-orm';

import { isString, pipe } from 'remeda';

import { users } from 'src/databases';
import { respr, session } from 'src/helpers';

import { app } from './app';

app.get('/info', async (ctx) => {
  const res = await session.get(ctx);
  if (!isString(res?.id)) throw new Error('User not found');
  return ctx.json(
    await pipe(eq(users.table.id, res.id), users.query, respr.decorator),
  );
});
