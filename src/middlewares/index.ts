import { iAuth } from './auth';
import { iRateLimit } from './limit';
import { iLogger } from './logger';
import { iSessionHandler } from './session';

export const middlewares = {
  iAuth,
  iRateLimit,
  iLogger,
  iSessionHandler,
};
