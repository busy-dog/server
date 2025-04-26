import * as captcha from './captcha';
import * as github from './github';
import * as google from './google';
import * as members from './members';
import * as s3 from './s3.min.io';
import * as users from './users';

const servers = { users, github, google, captcha, members, s3 };

export type * from './github';

export { servers, servers as svrs };
