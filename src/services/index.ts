import * as areas from './areas';
import * as crypto from './crypto';
import * as github from './github';
import * as google from './google';
import * as users from './users';

const services = { users, areas, crypto, github, google };

export { services, services as svcs };

export type * from './github';
export type * from './users';
