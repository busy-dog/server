import type { Readable } from 'node:stream';

import { isString } from 'remeda';

import { isUint8Array } from './tools';

export async function foldAsArrayBuffer(stream: Readable) {
  const chunks = (await stream.toArray()).reduce<Uint8Array[]>(
    (acc, cur: unknown) => {
      const chunk = isString(cur) ? Buffer.from(cur) : cur;
      return isUint8Array(chunk) ? acc.concat([chunk]) : acc;
    },
    [],
  );

  const { buffer, byteOffset, byteLength } = Buffer.concat(chunks);

  const res = buffer.slice(byteOffset, byteOffset + byteLength);

  if (res instanceof SharedArrayBuffer) {
    throw new Error('SharedArrayBuffer is not supported');
  }

  return res;
}
