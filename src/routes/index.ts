import type { Hono } from 'hono';

import * as github from './github';
import * as member from './member';
import * as otp from './otp';
import * as user from './user';

export const register = (app: Hono) => {
  otp.register(app);
  user.register(app);
  github.register(app);
  member.register(app);
  return app;
};
