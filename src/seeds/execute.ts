import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isArray, isError, isObject } from '@busymango/is-esm';

import { db, destroy } from 'src/databases';
import { report } from 'src/helpers';

const dir = dirname(fileURLToPath(import.meta.url));

const warn = (error: unknown) => {
  if (!isError(error)) console.warn(error);
  else report.warn(error, { name: 'seed' });
};

const max = await (async () => {
  const string = `SHOW VARIABLES LIKE 'max_allowed_packet';`;
  const [header, ..._] = await db.common.execute(string);
  if (isArray(header) && isObject(header[0]) && 'Value' in header[0]) {
    return Number(header[0].Value);
  } else {
    throw new Error('获取 max_allowed_packet 失败');
  }
})()

await Promise.all(
  readdirSync(dir).map(async (file) => {
    if (file.endsWith('.sql')) {
      const name = join(dir, file);
      try {
        if (max < statSync(name).size) {
          warn(new Error(`${file} 文件过大`));
        } else {
          const data = readFileSync(name, 'utf8');
          await db.common.execute(data);
        }
      } catch (error) {
        warn(error);
      }
    }
  }),
);

await destroy();
