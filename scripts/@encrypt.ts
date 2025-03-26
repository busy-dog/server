#! /usr/bin/env tsx

import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const { PWD, INIT_CWD } = process.env;
const cwd = process.cwd() ?? INIT_CWD ?? PWD;

await Promise.all(
  (await readdir(cwd)).map(async (name) => {
    if (name === '.env.keys') return;
    if (name.startsWith('.env')) {
      const dir = join(cwd, name);
      if ((await stat(dir)).isFile()) {
        spawn('pnpm', ['dotenvx', 'encrypt', '-f', dir], {
          stdio: 'inherit',
        });
      }
    }
  }),
);
