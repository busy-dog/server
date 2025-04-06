import { isError, isPlainObject } from 'remeda';

import { hex } from 'ansis';
import dayjs from 'dayjs';

import { DateFormatEn, colors } from 'src/constants';
import type { PlainObject } from 'src/utils';
import { compact } from 'src/utils';

function time(code?: string): string {
  const text = dayjs().format(DateFormatEn.DateSec);
  return code ? hex(code)(text).toString() : text;
}

export const info = (
  text: string,
  {
    directory,
    name = 'Server',
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

export const warn = (
  data: Error | string,
  options: {
    name?: string;
  } = {},
): void => {
  if (isError(data)) {
    const { message } = data;
    const name = options.name ?? data.name;
    console.warn(
      time(colors.amber),
      hex(colors.amber)(`[${name}]`),
      hex(colors.amber)(message),
    );
  } else {
    const name = options.name ?? 'Warn';
    console.warn(
      time(colors.amber),
      hex(colors.amber)(`[${name}]`),
      hex(colors.amber)(data),
    );
  }
};

export const error = (
  error: unknown,
  options: {
    name?: string;
  } = {},
): void => {
  const { name } = options;
  if (isError(error)) {
    console.error(
      time(colors.scarlet),
      hex(colors.scarlet)(`[${name ?? error.name}]`),
      '\n\t' + hex(colors.scarlet)(error.message),
      hex(colors.scarlet)(error.stack?.toString()),
    );
  }
};

export const sql = (
  query: string,
  _: unknown[],
  options: {
    name?: string;
  } = {},
): void => {
  const { name } = options;
  console.info(
    time(colors.violet),
    hex(colors.violet)(`[${name ?? 'SQL'}]`),
    hex(colors.violet)(query),
    // '\n\t' + hex(colors.violet)(format(query, params)),
  );
};
