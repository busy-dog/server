import { eq } from 'drizzle-orm';
import { isString, pipe } from 'remeda';

import { tables } from 'src/databases';
import { svrs } from 'src/servers';

import { respr, session } from '../helpers';
import { app } from './app';

app.get('/info', async (ctx) => {
  const res = await session.get(ctx);
  if (!isString(res?.id)) throw new Error('User not found');
  return ctx.json(
    await pipe(eq(tables.users.id, res.id), svrs.users.query, respr.decorator),
  );
});
