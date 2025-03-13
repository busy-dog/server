import type { Hono } from 'hono';

import * as github from './github';
import * as otp from './otp';
import * as user from './user';

export const register = (app: Hono) => {
  otp.register(app);
  user.register(app);
  github.register(app);
  return app;
};
