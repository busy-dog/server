import { Hono } from 'hono';

import type { AppEnv } from '../types';

export const app = new Hono<AppEnv>();
