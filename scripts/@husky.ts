import husky from 'husky';

if (process.env.CI === 'true') process.exit(0);

await husky();
