import { defineConfig } from 'drizzle-kit';

const {
  POSTGRESQL_SSL,
  POSTGRESQL_HOST,
  POSTGRESQL_PASSWORD,
  POSTGRESQL_USER,
  POSTGRESQL_DATABASE,
  POSTGRESQL_PORT = '3306',
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
    ssl:
      POSTGRESQL_SSL === 'true'
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
