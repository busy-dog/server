import * as captcha from './captcha';
import * as github from './github';
import * as google from './google';
import * as members from './members';
import * as users from './users';

const servers = { users, github, google, captcha, members };

export type * from './github';

export { servers, servers as svrs };
