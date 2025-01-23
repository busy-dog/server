import type { Hono } from 'hono';
import * as github from './github';

export const register = (app: Hono) => {
  github.register(app);
};
