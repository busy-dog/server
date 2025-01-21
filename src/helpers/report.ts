import type { Ansis } from 'ansis';
import { hex } from 'ansis';
import dayjs from 'dayjs';
import { DateFormatEn, colors } from 'src/constants';

export function time(code?: string): string {
  const text = dayjs().format(DateFormatEn.DateSec);
  return code ? hex(code)(text).toString() : text;
}

export const info = (...args: string[]): void => {
  console.info(hex(colors.aqua)(`[server] ${args.join(' ')}`));
};

export const error = (...args: string[]): void => {
  console.error(hex(colors.scarlet)(`[error] ${args.join(' ')}`));
};

export const ansis = (...args: (Ansis | string)[]): void => {
  const timer = time(colors.green.lime).toString();
  const source = [timer as Ansis | string].concat(args);
  const marker = hex(colors.green.lime)('[drizzle]').toString();
  console.info(source.map((e) => [marker, e.toString()].join(' ')).join('\n'));
};
