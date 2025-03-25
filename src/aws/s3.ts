import crypto from 'node:crypto';
import type { Readable } from 'node:stream';

import { S3, ServerSideEncryption } from '@aws-sdk/client-s3';

import { toPascalCaseKeys } from 'src/utils';

const s3 = new S3({
  region: 'us-east-2',
});

export const put = async (
  body: Readable | Buffer,
  {
    bucket,
  }: {
    bucket: string;
  },
) => {
  const key = crypto.randomUUID();

  const res = await s3.putObject(
    toPascalCaseKeys({
      key,
      body,
      bucket,
      serverSideEncryption: ServerSideEncryption.AES256,
    }),
  );

  return res;
};
