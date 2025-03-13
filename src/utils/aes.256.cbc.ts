import { isUint8Array } from '@busymango/is-esm';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

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

export const encode = (data: string, nonce = randomBytes(4)) => {
  const { AES_KEY } = process.env;
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(AES_KEY, 'hex');
  if (!isUint8Array(key)) {
    throw new Error('AES_KEY is not set');
  }
  if (!isUint8Array(nonce)) {
    throw new Error('nonce is not set');
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
