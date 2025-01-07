import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: '.drizzle',
  dialect: 'mysql',
  schema: 'src/schemas',
});
