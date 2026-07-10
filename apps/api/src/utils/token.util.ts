import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../config/env.js';
import type { JwtPayload } from '@repo/shared-types';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

/**
 * Issues both tokens as httpOnly cookies.
 * Domain is set per environment:
 *   - production: Domain=.<registrable-domain> so both storefront and admin can share the cookie
 *   - development: no Domain attribute — browsers treat localhost ports as same-site
 */
export function issueTokenCookies(res: Response, payload: JwtPayload): void {
  const isProd = env.NODE_ENV === 'production';
  const domain = isProd ? '.banhtrangnhana.com' : undefined;

  const cookieBase = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    ...(domain ? { domain } : {}),
  };

  res.cookie('access_token', signAccessToken(payload), {
    ...cookieBase,
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie('refresh_token', signRefreshToken(payload), {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearTokenCookies(res: Response): void {
  const isProd = env.NODE_ENV === 'production';
  const domain = isProd ? '.banhtrangnhana.com' : undefined;
  const opts = { httpOnly: true, ...(domain ? { domain } : {}) };
  res.clearCookie('access_token', opts);
  res.clearCookie('refresh_token', opts);
}
