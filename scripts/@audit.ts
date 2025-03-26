#! /usr/bin/env tsx

import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { isString } from 'remeda';

const { PWD, INIT_CWD } = process.env;
const cwd = process.cwd() ?? INIT_CWD ?? PWD;

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

const clean = (value: string) => {
  const quote = ((value: string) => {
    const cur = value.trim();
    const maybeQuote = cur[0];
    switch (maybeQuote) {
      case "'":
      case '"':
      case '`':
        return maybeQuote;
      default:
        return '';
    }
  })(value);

  // Remove surrounding quotes
  const cur = value.trim().replace(/^(['"`])([\s\S]*)\1$/gm, '$2');

  if (quote !== '"') return cur;

  return cur
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r') // carriage return
    .replace(/\\t/g, '\t'); // tabs
};

const parse = (src: string | Buffer) => {
  const rows = src.toString().replace(/\r\n?/gm, '\n');

  const res: Record<string, string> = {};

  const run = (rows: string) => {
    const match = LINE.exec(rows);
    if (match !== null) {
      const key = match[1];
      const value = match[2];
      res[key] = clean(value);
      isString(rows) && run(rows);
    }
  };

  run(rows);

  return res;
};

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
