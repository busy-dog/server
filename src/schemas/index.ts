import * as areas from './areas';
import * as dicts from './dicts';
import * as users from './users';

export const schemas = {
  ...areas,
  ...users,
  ...dicts,
};

export type * from './users';
