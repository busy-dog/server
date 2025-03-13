import * as crypto from './crypto';
import * as github from './github';
import * as google from './google';
import * as users from './users';

const services = { users, crypto, github, google };

export type * from './github';
export type * from './users';
export { services, services as svcs };
