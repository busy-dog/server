import { Hono } from 'hono';
import { validator } from 'hono/validator';

import { middlewares } from '../middlewares';
import type { AppEnv } from '../types';

export const app = new Hono<AppEnv>();

app.get(
  '/sync',
  middlewares.iRateLimit({
    quota: 10,
    window: 1 * 60 * 1000, // 1 minutes
  }),
  validator('form', async (value) => {
    const { file } = value;
    console.log(file);
  }),
  (c) => {
    return c.json({ message: 'Hello, World!' });
  },
);
