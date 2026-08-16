import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}

if (!JWT_REFRESH_SECRET) {
  throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is missing.');
}

export interface TokenPayload {
  id: string;          // UUID tài khoản từ QLCS
  username: string;    // admin, thon1, thon2...
  role: 'admin' | 'user'; // admin (Toàn xã), user (Trưởng thôn)
  village_id: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Xác thực Access Token được cấp từ QLCS SSO Provider bằng shared secret.
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

/**
 * Xác thực Refresh Token được cấp từ QLCS SSO Provider bằng shared secret.
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};
