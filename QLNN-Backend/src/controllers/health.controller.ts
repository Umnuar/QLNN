import type { Request, Response } from "express";

const startTime = Date.now();

export const getHealth = (_req: Request, res: Response) => {
	res.status(200).json({
		status: "ok",
		app: "qlnn-backend",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
		uptime: Math.floor((Date.now() - startTime) / 1000),
	});
};
