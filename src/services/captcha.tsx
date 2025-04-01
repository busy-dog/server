import { randomInt } from 'node:crypto';

import { raw } from 'hono/html';

import { Resend } from 'resend';

import { timingSafeEqual } from 'hono/utils/buffer';
import { isString } from 'remeda';
import { redis } from 'src/databases';

const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;

export const create = async (params: { email?: string }) => {
  if (!isString(RESEND_API_KEY)) {
    throw new Error('RESEND_API_KEY is not set');
  }

  if (!isString(RESEND_FROM_EMAIL)) {
    throw new Error('RESEND_FROM_EMAIL is not set');
  }

  const { email } = params;

  if (isString(email)) {
    const resend = new Resend(RESEND_API_KEY);

    const captcha = randomInt(100000, 1000000);

    await redis[0].set(
      `captcha:${email}`,
      captcha,
      'EX',
      // 5 minutes
      5 * 60,
    );

    return await resend.emails.send({
      to: email,
      subject: 'Captcha',
      from: `Captcha <${RESEND_FROM_EMAIL}>`,
      html: (
        <div>
          <p>Your captcha is {raw(captcha)}.</p>
        </div>
      ).toString(),
    });
  }

  throw new Error('Email is required');
};

export const isMatch = async (params: { captcha: string; email?: string }) => {
  const { email, captcha } = params;

  if (isString(email)) {
    const key = `captcha:${email}`;
    const val = await redis[0].get(key);
    if (!isString(val)) {
      throw new Error('Captcha is expired');
    }
    const res = await timingSafeEqual(captcha, val);
    await redis[0].del(key);
    return res;
  }

  throw new Error('Email is required');
};
