import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
	throw new Error("FATAL: JWT secrets missing.");
}

export interface TokenPayload {
	id: string;
	username: string;
	role: "admin" | "user";
	village_id: string | null;
	iat?: number;
	exp?: number;
}

export const generateAccessToken = (
	payload: Omit<TokenPayload, "iat" | "exp">,
): string => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (
	payload: Omit<TokenPayload, "iat" | "exp">,
): string => {
	return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): TokenPayload => {
	return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
	return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};
