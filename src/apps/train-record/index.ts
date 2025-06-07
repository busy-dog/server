import { Hono } from 'hono';

import { v7 } from 'uuid';

import { trainRec } from 'src/databases';
import { respr, s3, session } from 'src/helpers';

import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';
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
    const data = await req.formData();

    const txt = data.get('txt');
    if (!(txt instanceof File)) {
      throw new Error('Text file is required');
    }

    const deviceId = req.header('X-Device-Id');

    const buffer = await txt.arrayBuffer();

    const { id: memberId } = await session.getWithAuth(ctx);

    const rowId = v7();

    await trainRec.create({
      deviceId,
      memberId,
      id: rowId,
      creator: memberId,
      status: 'pending',
      fileName: txt.name,
      fileSize: buffer.byteLength,
    });

    const res = await s3.putObject(Buffer.from(buffer), {
      name: txt.name ?? dayjs().format('YYYY.MM.DD.HHmmss'),
      size: buffer.byteLength,
      meta: {
        owner: memberId,
        type: txt.type,
        lastModified: txt.lastModified,
      },
    });

    const body = await trainRec.update(
      {
        updater: memberId,
        s3Key: res.etag,
        status: 'synced',
        syncAt: new Date(),
      },
      eq(trainRec.table.id, rowId),
    );

    return json(respr.decorator(body));
  },
);

app.get(
  '/get',
  middlewares.iRateLimit({
    quota: 60,
    window: 1 * 60 * 1000, // 1 minutes
  }),
  middlewares.iZod(
    'json',
    z.object({
      s3Key: z.string(),
    }),
  ),
  async (ctx) => {
    const { body, header, req } = ctx;
    const { s3Key } = req.valid('json');
    header('Content-Type', 'text/plain');
    const buffer = await s3.getObject(s3Key);

    return body(buffer);
  },
);
