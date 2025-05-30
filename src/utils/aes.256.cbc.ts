import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { isUint8Array } from 'src/utils';

export const decode = (encrypted: string) => {
  const { AES_KEY } = process.env;
  const key = Buffer.from(AES_KEY, 'hex');
  const [iv, data] = encrypted.split(':');
  const nonce = Buffer.from(iv, 'hex');
  if (!isUint8Array(key)) {
    throw new Error('AES_KEY is not set');
  }
  if (!isUint8Array(nonce)) {
    throw new Error('nonce is not set');
  }

  const decipher = createDecipheriv('aes-256-cbc', key, nonce);

  return [
    (acc: string) => {
      return decipher.update(acc, 'hex', 'utf8');
    },
    (acc: string) => {
      return acc + decipher.final('utf8');
    },
  ].reduce<string>((acc, handler) => handler(acc), data);
};

export const encode = (data: string, nonce = randomBytes(16)) => {
  const { AES_KEY } = process.env;
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(AES_KEY, 'hex');

  if (!isUint8Array(key)) {
    throw new Error('AES_KEY is not set');
  }
  if (!isUint8Array(nonce)) {
    throw new Error('nonce is not set');
  }
  if (key.length !== 32) {
    throw new Error('Invalid AES_KEY:' + AES_KEY);
  }

  const cipher = createCipheriv(algorithm, key, nonce);

  return [
    (acc: string) => {
      return cipher.update(acc, 'utf8', 'hex');
    },
    (acc: string) => {
      return acc + cipher.final('hex');
    },
    (acc: string) => {
      return [nonce.toString('hex'), acc].join(':');
    },
  ].reduce<string>((acc, handler) => handler(acc), data);
};
