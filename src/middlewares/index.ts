import type { Hono } from 'hono';
import { cors } from 'hono/cors';

export const middlewares = (app: Hono) => {
  app.use('/api/*', cors());
};
