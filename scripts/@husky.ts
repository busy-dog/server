import husky from 'husky';

/**
 * @see https://typicode.github.io/husky/zh/how-to.html#%E8%B7%B3%E8%BF%87-git-%E9%92%A9%E5%AD%90
 */
if (process.env.CI === 'true') process.exit(0);

await husky();
