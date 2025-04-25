import * as Minio from 'minio';
import type { Readable } from 'node:stream';
import { isNullish } from 'remeda';
import { isTrueString } from 'src/utils';
import { z } from 'zod';

const minio = (() => {
  const store = {
    minio: null as Minio.Client | null,
  };

  return () => {
    if (isNullish(store.minio)) {
      const params = {
        endPoint: process.env.S3_ENDPOINT,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
        useSSL: isTrueString(process.env.S3_USE_SSL),
      };

      const data = z
        .object({
          endPoint: z.string(),
          accessKey: z.string(),
          secretKey: z.string(),
          useSSL: z.boolean().optional(),
        })
        .parse(params);

      store.minio = new Minio.Client(data);
    }
    return store.minio;
  };
})();

export const getBuckets = () => minio().listBuckets();

export const getObject = async (
  name: string,
  params: {
    bucket?: string;
  } = {},
) => {
  const { bucket = 'zeabur' } = params;
  if (!(await minio().bucketExists(bucket))) {
    throw new Error('Bucket ' + bucket + 'is not exists.');
  }
  return minio().getObject(bucket, name);
};

// var metaData = {
//   'Content-Type': 'text/plain',
//   'X-Amz-Meta-Testing': 1234,
//   example: 5678,
// }
export const putObject = async (
  stream: Readable | Buffer | string,
  params: {
    name: string;
    size?: number;
    bucket?: string;
    meta?: Minio.ItemBucketMetadata;
  },
) => {
  const { size, name, bucket = 'zeabur', meta } = params;
  if (!(await minio().bucketExists(bucket))) {
    throw new Error('Bucket ' + bucket + 'is not exists.');
  }
  return await minio().putObject(bucket, name, stream, size, meta);
};
