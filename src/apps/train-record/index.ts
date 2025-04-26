import { Hono } from 'hono';

import { svrs } from 'src/servers';
import { respr, session } from '../helpers';
import { middlewares } from '../middlewares';
import type { AppEnv } from '../types';

export const app = new Hono<AppEnv>();

app.post(
  '/sync',
  middlewares.iRateLimit({
    quota: 10,
    window: 1 * 60 * 1000, // 1 minutes
  }),
  async (ctx) => {
    const { json, req } = ctx;
    const file = await req.arrayBuffer();
    const { id } = await session.getWithAuth(ctx);
    const data = await svrs.s3.putObject(Buffer.from(file), {
      name: id,
    });
    return json(respr.decorator(data));
  },
);

app.get(
  '/get',
  middlewares.iRateLimit({
    quota: 60,
    window: 1 * 60 * 1000, // 1 minutes
  }),
  async (ctx) => {
    const { body, header } = ctx;
    header('Content-Type', 'text/plain');
    const { id } = await session.getWithAuth(ctx);
    const buffer = await svrs.s3.getObject(id);
    return body(buffer);
  },
);
