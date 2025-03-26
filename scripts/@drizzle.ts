#! /usr/bin/env tsx

import { spawn } from 'node:child_process';
import { promisify } from 'node:util';

import { program } from 'commander';

const { filename, command } = program
  .option('-f, --filename [char]', '指定环境文件', '.env')
  .option('-c, --command <char>', 'drizzle-kit要执行的命令')
  .parse()
  .opts<{
    filename: string;
    command: string;
  }>();

// drizzle-kit 命令依赖了 dotenvx 的配置，所以需要使用 dotenvx 来执行
const run = async (command: string) => {
  await promisify(spawn)(
    'pnpm',
    ['dotenvx', 'run', '-f', filename, '--', 'pnpm', 'drizzle-kit', command],
    { stdio: 'inherit' },
  );
};

run(command);
