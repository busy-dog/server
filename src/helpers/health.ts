import { isError } from '@busymango/is-esm';
import { iMySQLDBCommon } from 'src/databases';
import * as report from './report';

export async function iCheckMysql() {
  try {
    const rows = await iMySQLDBCommon.execute('SELECT 1');
    if (!(rows.length > 1)) {
      throw new Error('can\'t execute \`SELECT 1\`');
    }
    report.info('MySQL connection is healthy', report.time());
  } catch (error) {
    if (isError(error)) {
      console.error('Error during MySQL health check:', error.message);
    }
  }
}
