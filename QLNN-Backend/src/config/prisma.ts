import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// ============================================================
// Phone Encryption: AES-256-GCM + HMAC-SHA256 phone_hash
// ============================================================

const ENCRYPTION_KEY =
	process.env.ENCRYPTION_KEY ||
	(process.env.NODE_ENV !== "production"
		? "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
		: "");

if (!ENCRYPTION_KEY) {
	throw new Error(
		"FATAL: ENCRYPTION_KEY is not set in environment variables. Server cannot start without it.",
	);
}

const PHONE_HASH_PEPPER =
	process.env.PHONE_HASH_PEPPER ||
	(process.env.NODE_ENV !== "production"
		? "dakha_qlnn_phone_pepper_dev"
		: "");

if (!PHONE_HASH_PEPPER) {
	throw new Error(
		"FATAL: PHONE_HASH_PEPPER is not set in environment variables. Server cannot start without it.",
	);
}

const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, "hex");

export function encrypt(text: string): string {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-gcm", KEY_BUFFER, iv);
	const encrypted = Buffer.concat([
		cipher.update(text, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();
	// Format: iv:authTag:encrypted (all hex)
	return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encryptedText: string): string {
	try {
		const parts = encryptedText.split(":");
		if (parts.length !== 3) return encryptedText; // Not encrypted, return as-is
		const [ivHex, authTagHex, dataHex] = parts;
		const iv = Buffer.from(ivHex, "hex");
		const authTag = Buffer.from(authTagHex, "hex");
		const encrypted = Buffer.from(dataHex, "hex");
		const decipher = crypto.createDecipheriv("aes-256-gcm", KEY_BUFFER, iv);
		decipher.setAuthTag(authTag);
		const decrypted = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]);
		return decrypted.toString("utf8");
	} catch {
		return encryptedText; // If decryption fails, return original
	}
}

export function hashPhone(phone: string): string {
	return crypto
		.createHmac("sha256", PHONE_HASH_PEPPER)
		.update(phone.trim())
		.digest("hex");
}

function processInputData(data: any): any {
	if (!data || typeof data !== "object") return data;

	if (data.phone && typeof data.phone === "string" && data.phone.trim() !== "") {
		const plainPhone = data.phone.trim();
		// If already encrypted with 3 hex parts, do not re-encrypt
		if (plainPhone.split(":").length === 3) {
			return data;
		}
		data.phone_hash = hashPhone(plainPhone);
		data.phone_last4 = plainPhone.slice(-4);
		data.phone = encrypt(plainPhone);
	} else if (
		data.phone === null ||
		(typeof data.phone === "string" && data.phone.trim() === "")
	) {
		data.phone = null;
		data.phone_hash = null;
		data.phone_last4 = null;
	}

	return data;
}

function processOutputData(data: any): any {
	if (!data || typeof data !== "object") return data;

	if (Array.isArray(data)) {
		return data.map((item) => processOutputData(item));
	}

	if (data.phone && typeof data.phone === "string" && data.phone.includes(":")) {
		data.phone = decrypt(data.phone);
	}
	if (data.phone && !data.phone_last4) {
		data.phone_last4 = data.phone.slice(-4);
	}

	if (Array.isArray(data.households)) {
		data.households = data.households.map((item: any) => processOutputData(item));
	}

	return data;
}

function processWhereClause(where: any): any {
	if (!where || typeof where !== "object") return where;

	// Remap where.phone to where.phone_hash for exact search
	if (where.phone && typeof where.phone === "string") {
		where.phone_hash = hashPhone(where.phone.trim());
		delete where.phone;
	}

	return where;
}

const globalForPrisma = globalThis as unknown as {
	basePrisma: PrismaClient | undefined;
};

const basePrisma =
	globalForPrisma.basePrisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.basePrisma = basePrisma;

export const prisma = basePrisma.$extends({
	result: {
		households: {
			phone_last4: {
				needs: { phone: true, phone_last4: true },
				compute(hh) {
					return hh.phone_last4 || (hh.phone ? hh.phone.slice(-4) : null);
				},
			},
		},
	},
	query: {
		$allOperations({ model, operation, args, query }) {
			const encryptedModels = ["households", "villages"];

			if (!model || !encryptedModels.includes(model)) {
				return query(args);
			}

			if (model === "households") {
				if (operation === "create" && args.data) {
					args.data = processInputData(args.data);
				}
				if ((operation === "update" || operation === "updateMany") && args.data) {
					args.data = processInputData(args.data);
				}
				if (operation === "upsert") {
					if (args.create) args.create = processInputData(args.create);
					if (args.update) args.update = processInputData(args.update);
				}
				if (operation === "createMany" && args.data && Array.isArray(args.data)) {
					args.data = args.data.map((d: any) => processInputData(d));
				}
				if (args.where) {
					args.where = processWhereClause(args.where);
				}
			}

			return query(args).then((result: any) => {
				return processOutputData(result);
			});
		},
	},
});
