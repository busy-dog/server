import type { Hono } from 'hono';
import { cors } from 'hono/cors';
import { session } from './session';

export const middlewares = (app: Hono) => {
  app.use('/api/*', cors());
  app.use('*', session());
};
