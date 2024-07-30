import { AQUA, DateFormatEn, LIME_GREEN, VIOLET } from 'src/constants';
import { type Ansis, hex } from 'ansis';
import type { Logger as DrizzleLogger } from 'drizzle-orm';
import dayjs from 'dayjs';
import { format } from 'mysql2';

export function iServerTime(code?: string): string {
  const text = dayjs().format(DateFormatEn.DateSec);
  return code ? hex(code)(text).toString() : text;
}

export const iServerLog = (...args: string[]): void => {
  console.info(hex(AQUA)(`[mango-hono-server] ${args.join(' ')}`));
};

export const iAnsisLog = (...args: (Ansis | string)[]): void => {
  const timer = iServerTime(LIME_GREEN).toString();
  const source = [timer as Ansis | string].concat(args);
  const marker = hex(LIME_GREEN)('[mango-drizzle-ansis]').toString();
  console.info(
    source.map((ansis) => [marker, ansis.toString()].join(' ')).join('\n'),
  );
};
export class AnsisLogger implements DrizzleLogger {
  logQuery(query: string, params: unknown[]): void {
    iAnsisLog(hex(VIOLET)(format(query, params)));
  }
}
