import type { PlainObject } from '@busymango/is-esm';
import { snakeCase } from 'change-case';

type SnakeCase<T> = T extends string
  ? T extends `${infer F}${infer R}`
    ? F extends Capitalize<F> // 如果第一个字符是大写
      ? `_${Lowercase<F>}${SnakeCase<R>}` // 转为小写并加上下划线
      : `${Lowercase<F>}${SnakeCase<R>}` // 否则只转为小写
    : T
  : T;

export type SnakeCaseObject<T extends Record<string, unknown>> = {
  [K in SnakeCase<keyof T>]: T[K];
};

export const changeCase = <T extends PlainObject>(data: T) => {
  const entries = Object.entries(data);
  return entries.reduce(
    (acc, [key, val]) => ({
      ...acc,
      [snakeCase(key)]: val,
    }),
    {} as SnakeCaseObject<T>,
  );
};
