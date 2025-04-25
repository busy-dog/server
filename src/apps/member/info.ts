import { eq } from 'drizzle-orm';
import { isString } from 'remeda';

import { tables } from 'src/databases';

import { svrs } from 'src/servers';

import { respr, session } from '../helpers';
import { app } from './app';

const { members: table } = tables;

app.get('/info', async (ctx) => {
  const res = await session.get(ctx);
  if (!isString(res?.id)) throw new Error('User not found');
  const info = await svrs.members.query(eq(table.id, res.id));
  return ctx.json(respr.decorator(info));
});
