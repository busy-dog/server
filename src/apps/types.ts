import type { Env } from 'hono';

/**
 * 详情见 https://hono.dev/docs/api/context#env
 */
export interface AppEnv extends Env {
  Bindings: typeof process.env;
}
