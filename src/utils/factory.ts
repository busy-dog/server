import {
  filter,
  isNullish,
  isPlainObject,
  isString,
  join,
  map,
  mapValues,
  omitBy,
  pipe,
} from 'remeda';

import { isEmptyValue, isStringArray, isURLSearchParams } from './tools';

/**
 * Constructs and returns a URLSearchParams object based on the provided initialization data.
 * Supports initializing with various types: URLSearchParams, string, string arrays, and plain objects.
 * Returns undefined if the initialization data does not match any supported type.
 *
 * @param init The initialization data for URLSearchParams.
 * @returns A URLSearchParams object constructed from the provided data, or undefined if invalid.
 */
export function iSearchParams(init: unknown) {
  if (isEmptyValue(init)) return;
  if (isString(init) || isURLSearchParams(init)) {
    return new URLSearchParams(init);
  }
  if (isStringArray(init)) {
    return new URLSearchParams(
      pipe(
        init,
        filter((e) => e.includes('=')),
        map((e) => e.trim()),
        join('&'),
      ),
    );
  }
  if (isPlainObject(init)) {
    return new URLSearchParams(
      pipe(
        init,
        mapValues((val) => val?.toString() as string),
        omitBy(isNullish),
      ),
    );
  }
  return;
}

export const iSrc = (host: string) => (api: string, queries?: unknown) =>
  [`${host}${api}`, iSearchParams(queries)].join('?');
