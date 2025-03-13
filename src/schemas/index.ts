import * as dicts from './dicts';
import * as users from './users';

export const schemas = {
  ...users,
  ...dicts,
};

export type * from './users';
