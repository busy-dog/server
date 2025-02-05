import { isNil, isString } from '@busymango/is-esm';
import type { KeyPairSyncResult } from 'crypto';
import { generateKeyPairSync } from 'crypto';

import { regexs } from 'src/constants';
import { redis } from 'src/databases';

/**
 * 获取RSA key pair
 */
export const keypair = () => {
  const key = 'rsa.key.pair';

  const ex = 60 * 60 * 24 * 30; // 30 days

  type RSAKeyPair = KeyPairSyncResult<string, string>;

  const { RSA_PRIVATE_KEY, RSA_PUBLIC_KEY } = regexs ?? {};

  const parse = <T>(data: unknown) => {
    try {
      if (!isString(data)) return null;
      return JSON.parse(data) as T;
    } catch (_) {
      return null;
    }
  };

  const generate = async () => {
    const res = parse<RSAKeyPair>(await redis[0].get(key));

    if (
      !isNil(res) &&
      RSA_PUBLIC_KEY.test(res.publicKey) &&
      RSA_PRIVATE_KEY.test(res.privateKey)
    ) {
      return res;
    }

    const pair = await generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const val = JSON.stringify(pair);
    await redis[0].set(key, val, 'EX', ex);
    return pair;
  };

  return generate();
};
