import { mapKeys, toCamelCase, toSnakeCase } from 'remeda';
import type { PascalCase, PascalCasedProperties } from 'type-fest';

export const toPascalCase = <T extends string>(str: T) => {
  return toCamelCase(str).replace(/^\w/, (c) =>
    c.toUpperCase(),
  ) as PascalCase<T>;
};

export const toPascalCaseKeys = <T extends object>(data: T) => {
  return mapKeys(data, (key) =>
    toPascalCase(key.toString()),
  ) as PascalCasedProperties<T>;
};

export const toSnakeCaseKeys = <T extends object>(data: T) => {
  return mapKeys(data, (key) =>
    toSnakeCase(key.toString()),
  ) as PascalCasedProperties<T>;
};
