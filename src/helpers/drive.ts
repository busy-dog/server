import Driver from '@busymango/fetch-driver';

const {
  RAPIDAPI_API_KEY,
  ABSTRACT_API_KEY,
  RAPIDAPI_API_DOMAIN,
  ABSTRACT_API_DOMAIN,
} = process.env;

export const { drive } = new Driver([
  async (context, next) => {
    const { api, options } = context;

    if (api.includes(RAPIDAPI_API_DOMAIN)) {
      const { headers } = options;
      headers.set('x-rapidapi-key', RAPIDAPI_API_KEY);
      try {
        const { host } = new URL(api);
        headers.set('x-rapidapi-host', host);
      } catch (error) {
        console.warn('Rapidapi需要包含域名信息');
      }
    }

    if (api.includes(ABSTRACT_API_DOMAIN)) {
      try {
        const { origin, pathname, searchParams } = new URL(api);
        searchParams.append('api_key', ABSTRACT_API_KEY);
        context.api = [origin, pathname, '?', searchParams.toString()].join('');
      } catch (error) {
        console.warn('Abstractapi需要包含域名信息');
      }
    }

    await next();
  },
]);
