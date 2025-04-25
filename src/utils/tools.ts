import {
  filter,
  hasAtLeast,
  isArray,
  isEmpty,
  isNullish,
  isNumber,
  isObjectType,
  isPlainObject,
  isString,
  join,
  map,
  mapValues,
  omitBy,
  pipe,
} from 'remeda';

export type Nil = undefined | null;

export type Scalar = string | number;

export type PlainObject = Record<string, unknown>;

/**
 * Checks if the given source is an instance of URLSearchParams.
 * If is URLSearchParams, narrow to type URLSearchParams.
 * @param {unknown} source - The value to be checked.
 * @returns {boolean} Returns true if the source is an instance of URLSearchParams, false otherwise.
 */
export function isURLSearchParams(source: unknown): source is URLSearchParams {
  return source instanceof URLSearchParams;
}

/**
 * Checks if the given source is an instance of Uint8Array.
 * If is Uint8Array, narrow to type Uint8Array.
 * @param {unknown} source - The value to be checked.
 * @returns {boolean} Returns true if the source is an instance of Uint8Array, false otherwise.
 */
export function isUint8Array(source: unknown): source is Uint8Array {
  return source instanceof Uint8Array;
}

export const isNonEmptyString = (source: unknown): source is string => {
  return isString(source) && hasAtLeast([...source], 1);
};

export const isNonEmptyArray = (source: unknown): source is unknown[] => {
  return isArray(source) && hasAtLeast(source, 1);
};

/**
 * Narrow source type to `Array` && Check is not empty.
 */
export function isStringArray(source: unknown): source is string[] {
  return isNonEmptyArray(source) && source.every(isString);
}

// type UserKeys = keyof UserSelectModel;

export const isScalar = (value: unknown): value is Scalar =>
  isString(value) || isNumber(value);

/**
 * Removes falsy values (false, null, 0, "", undefined, and NaN) from an array.
 * @param source - The input array to compact.
 * @returns An array with falsy values removed.
 */
export function compact<T = unknown>(
  source: (T | Nil | false | '' | 0)[],
): T[] {
  return source.filter(Boolean) as T[];
}

/**
 * 如果传入的值不为 false，则返回该值；如果为 false，则返回占位符值。
 *
 * @param source 要检查的值。
 * @param placeholder 当 source 为 false 时返回的占位符值，默认为 undefined。
 * @returns 如果 source 不为 false，则返回 source；否则返回占位符值（默认为 undefined）。
 *
 * @example
 * // 示例 1: 传入非 false 值
 * const result1 = ensure(42); // result1 = 42
 *
 * // 示例 2: 传入 false 值，返回 undefined（默认占位符）
 * const result2 = ensure(false); // result2 = undefined
 *
 * // 示例 3: 传入 false 值，返回自定义占位符
 * const result3 = ensure(false, 'fallback'); // result3 = 'fallback'
 *
 * // 示例 4: 传入布尔表达式
 * const compare = true;
 * const res = 'value';
 * const result4 = ensure(compare && res); // result4 = 'value'
 */
export function ensure<const T = unknown, D = undefined>(
  source: T,
  placeholder?: D,
) {
  type V = Exclude<T, false>;
  type R = T extends false ? (V extends never ? D : V | D) : V;
  return (source === false ? placeholder : source) as R;
}

/**
 * Wraps a callback function with error handling, returning undefined if an error occurs.
 * @param this The context to bind to the callback function.
 * @param callback The callback function to be executed.
 * @returns A new function that wraps the callback function with error handling.
 */
export function safe<A extends unknown[], R>(
  this: unknown,
  callback: (...args: A) => R,
) {
  return (...args: A) => {
    try {
      return callback.call(this, ...args);
    } catch {
      return undefined;
    }
  };
}

export const isEmptyValue = (
  data: unknown,
): data is '' | Nil | [] | Record<string, never> => {
  if (isNumber(data)) return Number.isNaN(data);
  if (isString(data)) return data.length === 0;
  if (isArray(data)) return !hasAtLeast(data, 1);
  if (isObjectType(data) && isEmpty(data)) return true;
  return false;
};

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

export const isTrueString = (data: unknown): data is 'true' => {
  if (!isString(data)) return false;
  return data.trim().toLowerCase() === 'true';
};

export const isFalseString = (data: unknown): data is 'false' => {
  if (!isString(data)) return false;
  return data.trim().toLowerCase() === 'false';
};

export const isBooleanString = (data: unknown): data is 'true' | 'false' => {
  if (!isString(data)) return false;
  return isFalseString(data) || isTrueString(data);
};
