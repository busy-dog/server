export const RSA_PUBLIC_KEY =
  /^-----BEGIN (RSA )?PUBLIC KEY-----\n([A-Za-z0-9+/=]+\n)*-----END (RSA )?PUBLIC KEY-----$/;

export const RSA_PRIVATE_KEY =
  /^-----BEGIN PUBLIC KEY-----\s?([A-Za-z0-9+/=]+\s?)*-----END PUBLIC KEY-----$/;
