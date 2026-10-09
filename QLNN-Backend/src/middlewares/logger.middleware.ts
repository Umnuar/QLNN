import type { NextFunction, Request, Response } from "express";
import { getClientIp, logger } from "../utils/logger";

export { getClientIp };

/**
 * Kiểm tra xem endpoint có phải là liveness/heartbeat cần bỏ qua log hay không
 */
const isLivenessEndpoint = (path: string): boolean => {
	const clean = path.split("?")[0];
	return (
		clean === "/api/health" ||
		clean === "/api/ping" ||
		clean === "/favicon.ico"
	);
};

/**
 * Middleware ghi log các HTTP request theo chuẩn [HTTP] 1 dòng tối ưu Docker
 */
export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const startTime = Date.now();
	const clientIp = getClientIp(req);

	res.on("finish", () => {
		const duration = Date.now() - startTime;
		const method = req.method;
		const url = req.originalUrl || req.url;
		const status = res.statusCode;

		// Bỏ qua log [HTTP] cho endpoint liveness: /api/health, /api/ping, /favicon.ico
		if (isLivenessEndpoint(url)) {
			return;
		}

		if (process.env.NODE_ENV !== "test") {
			logger.http(method, url, status, duration, clientIp);
		}
	});

	next();
};
