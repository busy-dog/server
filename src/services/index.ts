import * as captcha from './captcha';
import * as github from './github';
import * as google from './google';
import * as health from './health';
import * as members from './members';
import * as users from './users';

const services = { users, github, google, captcha, health, members };

export type * from './github';

export { services, services as svcs };
