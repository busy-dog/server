import { Hono } from 'hono';

import { v7 } from 'uuid';

import { trainRec } from 'src/databases';
import { respr, s3, session } from 'src/helpers';

import { eq } from 'drizzle-orm';
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

    const file = data.get('file');
    if (!(file instanceof File)) {
      throw new Error('File is required');
    }

    const deviceId = req.header('X-Device-Id');

    const buffer = await file.arrayBuffer();

    const { id: memberId } = await session.getWithAuth(ctx);

    const disposition = req.header('Content-Disposition');

    if (!disposition) {
      throw new Error('Content-Disposition header is required');
    }

    const rowId = v7();

    await trainRec.create({
      deviceId,
      memberId,
      id: rowId,
      creator: memberId,
      status: 'pending',
      fileName: file.name,
      fileSize: buffer.byteLength,
    });

    const res = await s3.putObject(Buffer.from(buffer), {
      name: file.name,
      size: buffer.byteLength,
      meta: {
        owner: memberId,
        disposition,
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
  async (ctx) => {
    const { body, header } = ctx;
    header('Content-Type', 'text/plain');
    const { id } = await session.getWithAuth(ctx);
    const buffer = await s3.getObject(id);
    return body(buffer);
  },
);
