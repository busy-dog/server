import { format } from 'mysql2';

import { type PlainObject, isError, isPlainObject } from '@busymango/is-esm';
import { compact } from '@busymango/utils';
import { hex } from 'ansis';
import dayjs from 'dayjs';

import { DateFormatEn, colors } from 'src/constants';

function time(code?: string): string {
  const text = dayjs().format(DateFormatEn.DateSec);
  return code ? hex(code)(text).toString() : text;
}

export const info = (
  text: string,
  {
    directory,
    name = 'server',
    color = colors.aqua,
  }: {
    color?: string;
    name?: string;
    directory?: PlainObject;
  } = {},
): void => {
  const format = (data: PlainObject): string | undefined => {
    const entries = Object.entries(data);
    const handler = (acc: string[], cur: [string, unknown]): string[] => [
      ...acc,
      `${cur[0]}: ${cur[1]}`,
    ];
    return entries.reduce<string[]>(handler, []).join('\n\t');
  };

  console.info(
    ...compact([
      time(color),
      hex(color)(`[${name}]`),
      hex(color)(text),
      isPlainObject(directory) && hex(color)('\n\t' + format(directory)),
    ]),
  );
};

export const warn = (error: Error, params: {
  name?: string;
} = {},): void => {
  const { name, message, stack } = error;
  console.error(
    time(colors.amber),
    hex(colors.amber)(`[${params.name ?? name}]`),
    hex(colors.amber)(message),
    hex(colors.amber)(stack?.toString()),
  );
};

export const error = (
  error: unknown,
  params: {
    name?: string;
  } = {},
): void => {
  if (isError(error)) {
    console.error(
      time(colors.scarlet),
      hex(colors.scarlet)(`[${params.name ?? error.name}]`),
      '\n\t' + hex(colors.scarlet)(error.message),
      hex(colors.scarlet)(error.stack?.toString()),
    );
  }
};

export const mysql = (query: string, params: unknown[]): void => {
  console.info(
    time(colors.violet),
    hex(colors.violet)('[drizzle]'),
    '\n\t' + hex(colors.violet)(format(query, params)),
  );
};
