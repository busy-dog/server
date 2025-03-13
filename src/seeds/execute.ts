import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isError } from '@busymango/is-esm';

import { db, destroy } from 'src/databases';
import { report } from 'src/helpers';

const dir = dirname(fileURLToPath(import.meta.url));

const warn = (error: unknown) => {
  if (!isError(error)) console.warn(error);
  else report.warn(error, { name: 'seed' });
};

await Promise.all(
  readdirSync(dir).map(async (file) => {
    if (file.endsWith('.sql')) {
      const name = join(dir, file);
      try {
        // 文件不得大于1GB
        if (1024 * 1024 * 1024 < statSync(name).size) {
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
