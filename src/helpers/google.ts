import type { Context } from 'hono';

import { google } from 'googleapis';

const { OAuth2 } = google.auth;

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env ?? {};

const oauth = new OAuth2({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: 'http://127.0.0.1:8080',
});

export const signin = async (_: Context) => {
  return oauth.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/',
    ],
  });
};
