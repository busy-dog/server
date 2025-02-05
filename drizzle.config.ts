import { defineConfig } from 'drizzle-kit';

const {
  MYSQL_PUBLIC_HOST,
  MYSQL_PUBLIC_PASSWORD,
  MYSQL_PUBLIC_USER,
  MYSQL_PUBLIC_DATABASE,
  MYSQL_PUBLIC_PORT = 3306,
} = process.env;

export default defineConfig({
  out: '.drizzle',
  dialect: 'mysql',
  schema: 'src/schemas/drizzle.ts',
  dbCredentials: {
    user: MYSQL_PUBLIC_USER,
    host: MYSQL_PUBLIC_HOST,
    port: Number(MYSQL_PUBLIC_PORT),
    password: MYSQL_PUBLIC_PASSWORD,
    database: MYSQL_PUBLIC_DATABASE,
  },
});
