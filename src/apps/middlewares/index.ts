import { iAuth } from './auth';
import { iRateLimit } from './limit';
import { iLogger } from './logger';
import { iZod } from './zod';

export const middlewares = {
  iZod,
  iAuth,
  iLogger,
  iRateLimit,
};
