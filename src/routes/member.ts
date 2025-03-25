import type { Hono } from 'hono';
import { validator } from 'hono/validator';
import { isString } from 'remeda';

import { aws } from 'src/aws';
import { report, resHandler, session } from 'src/helpers';

export const register = (app: Hono) => {
  const { decorator } = resHandler;
  /**
   * 用户训练数据同步
   */
  app.post(
    '/member/record/async',
    validator('cookie', async (_, ctx) => {
      const res = await session.get(ctx);
      const { access_token: token } = res ?? {};
      if (isString(token)) return { token };
      return ctx.json(decorator(new Error('Github token not find')), 401);
    }),
    async ({ req, json }) => {
      try {
        const { AWS_S3_BUCKET: bucket } = process.env;
        if (!isString(bucket)) {
          throw new Error('AWS_S3_BUCKET is not set');
        }

        await aws.s3.put(Buffer.from(await req.arrayBuffer()), {
          bucket,
        });

        return json(decorator(null));
      } catch (error) {
        report.error(error);
        return json(decorator(error));
      }
    },
  );
};
