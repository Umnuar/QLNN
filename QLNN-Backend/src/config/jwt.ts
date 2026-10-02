import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
	throw new Error("FATAL: JWT secrets missing.");
}

const WEAK_SECRETS = [
	"qlcs_jwt_secret_2025_a8f3b7c9d4e1f2g6h5",
	"qlcs_jwt_refresh_2025_z9y8x7w6v5u4t3s2r1",
	"CHANGE_ME_TO_A_SECURE_RANDOM_SECRET_AT_LEAST_32_CHARS",
	"CHANGE_ME_TO_A_SECURE_RANDOM_REFRESH_SECRET_AT_LEAST_32_CHARS",
	"secret",
	"default_secret",
];

if (
	process.env.NODE_ENV === "production" &&
	(JWT_SECRET.length < 32 ||
		JWT_REFRESH_SECRET.length < 32 ||
		WEAK_SECRETS.includes(JWT_SECRET) ||
		WEAK_SECRETS.includes(JWT_REFRESH_SECRET))
) {
	throw new Error(
		"FATAL SECURITY ERROR: JWT_SECRET or JWT_REFRESH_SECRET is insecure, too short (< 32 chars), or using sample placeholder in production.",
	);
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
