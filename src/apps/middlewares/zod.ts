import type { core } from 'zod/v4';

import { ZodObject, parseAsync } from 'zod/v4';

import type { ValidationTargets } from 'hono';
import { validator } from 'hono/validator';
import { keys, merge, pipe, reduce } from 'remeda';
import type { PlainObject } from 'src/utils';

export const iZod = <
  T extends keyof ValidationTargets,
  S extends core.$ZodType,
>(
  target: T,
  schema: S,
) =>
  validator(target, async (val) => {
    const value = (() => {
      if (target === 'header' && schema instanceof ZodObject) {
        return pipe(
          schema.shape,
          keys,
          reduce((acc, key: string) => {
            const headers = val as Record<string, string>;
            const cur = headers[key] ?? headers[key.toLowerCase()];
            return merge(acc, { [key]: cur });
          }, {} as PlainObject),
        );
      }
      return val;
    })();

    return await parseAsync(schema, value);
  });
