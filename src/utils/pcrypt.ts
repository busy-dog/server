/**
 * 客户端提交的密码必须为hash值
 * ```ts
 * async function sha256Encrypt(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
 * ```
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { isArrayBufferView } from 'node:util/types';
import { isString } from 'remeda';

export const createSalt = () => randomBytes(16).toString('hex');

export const createHash = (password: string, salt: string) => {
  return scryptSync(password, salt, 32).toString('hex');
};

export const pack = (hashed: string, salt: string) => {
  return [hashed, salt].join('.');
};

export const unpack = (data: string) => {
  const [hashed, salt] = data.split('.');
  if (!isString(salt)) {
    throw new Error('Invalid salt');
  }
  return { hashed, salt };
};

export const compare = (password: string, stored: string) => {
  const { hashed, salt } = unpack(stored);
  const buffer1 = Buffer.from(hashed, 'hex');
  const buffer2 = Buffer.from(createHash(password, salt), 'hex');
  return (
    isArrayBufferView(buffer1) &&
    isArrayBufferView(buffer2) &&
    timingSafeEqual(buffer1, buffer2)
  );
};
