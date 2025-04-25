import { iAuth } from './auth';
import { iRateLimit } from './limit';
import { iLogger } from './logger';

export const middlewares = {
  iAuth,
  iLogger,
  iRateLimit,
};
