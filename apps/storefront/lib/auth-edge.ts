import { jwtVerify } from 'jose';
import { env } from './env';

export type JwtPayload = {
  userId: string;
  role: 'customer' | 'admin';
};

/**
 * Edge-compatible JWT verification.
 * Used in middleware to protect routes.
 */
export async function verifyAuthToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch (err) {
    return null;
  }
}
