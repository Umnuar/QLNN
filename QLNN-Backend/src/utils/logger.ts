import type { Request } from "express";

/**
 * Trích xuất địa chỉ IP thực của client hỗ trợ qua Cloudflare Tunnel và reverse proxies
 */
export const getClientIp = (req: Request): string => {
	let ip = "";
	const cfIp = req.headers["cf-connecting-ip"];
	if (cfIp) {
		ip = (Array.isArray(cfIp) ? cfIp[0] : cfIp).trim();
	} else {
		const forwarded = req.headers["x-forwarded-for"];
		if (forwarded) {
			const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
			ip = ips.split(",")[0].trim();
		} else {
			ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
		}
	}
	if (ip.startsWith("::ffff:")) {
		ip = ip.substring(7);
	}
	return ip || "127.0.0.1";
};

/**
 * Lấy timestamp chuẩn [HH:mm:ss] theo múi giờ hệ thống
 */
export const getTimestamp = (): string => {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/**
 * Parse thông tin kết nối CSDL từ URL
 */
export const parseDbInfo = (): {
	host: string;
	port: string;
	database: string;
} => {
	try {
		const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
		if (raw) {
			const parsed = new URL(raw);
			return {
				host: parsed.hostname || "localhost",
				port: parsed.port || "5432",
				database: parsed.pathname.replace(/^\//, "") || "postgres",
			};
		}
	} catch {
		// fallback
	}
	return { host: "localhost", port: "5432", database: "postgres" };
};

const isColorEnabled = (): boolean => {
	return Boolean(
		process.stdout.isTTY &&
			!process.env.NO_COLOR &&
			process.env.FORCE_COLOR !== "0",
	);
};

const colors = {
	reset: "\x1b[0m",
	dim: "\x1b[2m",
	bold: "\x1b[1m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	red: "\x1b[31m",
};

const wrapColor = (colorCode: string, text: string): string => {
	return isColorEnabled() ? `${colorCode}${text}${colors.reset}` : text;
};

export const logger = {
	start(port: number | string, dbConnected: boolean, env: string): void {
		const time = getTimestamp();
		const tag = wrapColor(colors.green, "[START]");
		const dbStatus = dbConnected ? "Connected" : "Disconnected";
		console.log(
			`[${time}] ${tag} Service ready on port ${port} | DB: ${dbStatus} | Env: ${env}`,
		);
	},

	http(
		method: string,
		path: string,
		status: number,
		duration: number,
		ip: string,
	): void {
		const time = getTimestamp();
		const tag = wrapColor(colors.cyan, "[HTTP]");

		let methodStr = method;
		let statusStr = String(status);

		if (isColorEnabled()) {
			if (method === "GET") methodStr = wrapColor(colors.green, method);
			else if (method === "POST") methodStr = wrapColor(colors.blue, method);
			else if (method === "PUT") methodStr = wrapColor(colors.yellow, method);
			else if (method === "DELETE") methodStr = wrapColor(colors.red, method);
			else methodStr = wrapColor(colors.magenta, method);

			if (status >= 500) statusStr = wrapColor(colors.red, String(status));
			else if (status >= 400)
				statusStr = wrapColor(colors.yellow, String(status));
			else if (status >= 300) statusStr = wrapColor(colors.cyan, String(status));
			else statusStr = wrapColor(colors.green, String(status));
		}

		console.log(
			`[${time}] ${tag} ${methodStr} ${path} ${statusStr} ${duration}ms | IP: ${ip}`,
		);
	},

	auth(username: string, role: string, action: string, ip: string): void {
		const time = getTimestamp();
		const tag = wrapColor(colors.magenta, "[AUTH]");
		console.log(
			`[${time}] ${tag} ${username} (${role}) -> ${action} | IP: ${ip}`,
		);
	},

	cron(jobName: string, status: string): void {
		const time = getTimestamp();
		const tag = wrapColor(colors.blue, "[CRON]");
		console.log(`[${time}] ${tag} ${jobName} -> ${status}`);
	},

	db(host: string, port: string | number, database: string): void {
		const time = getTimestamp();
		const tag = wrapColor(colors.yellow, "[DB]");
		console.log(
			`[${time}] ${tag} Connected to PostgreSQL at ${host}:${port}/${database}`,
		);
	},

	error(code: string | number, message: string): void {
		const time = getTimestamp();
		const tag = wrapColor(colors.red, "[ERROR]");
		console.error(`[${time}] ${tag} [${code}] ${message}`);
	},
};
