#! /usr/bin/env tsx
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { parse } from '@dotenvx/dotenvx';

const { PWD, INIT_CWD } = process.env;
const cwd = process.cwd() ?? INIT_CWD ?? PWD;

await Promise.all(
  (await readdir(cwd)).map(async (name) => {
    if (name === '.env.keys') return;
    if (name.startsWith('.env')) {
      const dir = join(cwd, name);
      if ((await stat(dir)).isFile()) {
        const res = parse(await readFile(dir, 'utf-8'));
        Object.entries(res).forEach(([key, value]) => {
          if (!key.includes('DOTENV_PUBLIC_KEY')) {
            if (!value.startsWith('encrypted:')) {
              throw new Error(`${key} is not encrypted: ${value}`);
            }
          }
        });
      }
    }
  }),
);
