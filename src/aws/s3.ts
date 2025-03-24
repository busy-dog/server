import crypto from 'node:crypto';
import type { ReadStream } from 'node:fs';

import { S3 } from '@aws-sdk/client-s3';

import { toPascalCaseKeys } from 'src/utils';

const s3 = new S3({
  region: 'us-east-2',
});

export const put = async (
  body: ReadStream,
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
    }),
  );

  return res;
};
