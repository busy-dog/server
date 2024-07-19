import { Logger as DrizzleLogger } from 'drizzle-orm';
import { hex } from 'ansis';
import { format } from 'mysql2';
import { AQUA, LIME_GREEN, VIOLET } from 'src/constants';
import dayjs from 'dayjs';

export const iServerLog = (text: string): void => {
  console.info(hex(AQUA)(`[mango-hono-server] ${text}`));
};

export class AnsisLogger implements DrizzleLogger {
  logQuery(query: string, params: unknown[]): void {
    console.info(
      [
        hex(LIME_GREEN)(dayjs().toISOString()).toString(),
        hex(VIOLET)(format(query, params)).toString(),
      ].join('\n'),
    );
  }
}
