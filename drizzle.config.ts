import { defineConfig } from 'drizzle-kit';

const {
  POSTGRESQL_HOST,
  POSTGRESQL_PASSWORD,
  POSTGRESQL_USER,
  POSTGRESQL_DATABASE,
  POSTGRESQL_PORT = 3306,
} = process.env;

export default defineConfig({
  out: '.drizzle',
  dialect: 'postgresql',
  schema: './drizzle.ts',
  dbCredentials: {
    user: POSTGRESQL_USER,
    host: POSTGRESQL_HOST,
    port: Number(POSTGRESQL_PORT),
    password: POSTGRESQL_PASSWORD,
    database: POSTGRESQL_DATABASE,
  },
});
