import * as captcha from './captcha';
import * as github from './github';
import * as google from './google';
import * as users from './users';

const services = { users, github, google, captcha };

export type * from './github';
export type * from './users';
export { services, services as svcs };
