import { defineConfig } from 'drizzle-kit';

const {
  POSTGRE_SSL,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USERNAME,
  POSTGRES_DATABASE,
  POSTGRES_PORT = '3306',
} = process.env;

export default defineConfig({
  out: '.drizzle',
  dialect: 'postgresql',
  schema: './drizzle.ts',
  dbCredentials: {
    user: POSTGRES_USERNAME,
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT),
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
    ssl:
      POSTGRE_SSL === 'true'
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  },
  // migrations: {
  //   table: 'my-migrations-table', // `__drizzle_migrations` by default
  //   schema: 'public', // used in PostgreSQL only, `drizzle` by default
  // },
});
