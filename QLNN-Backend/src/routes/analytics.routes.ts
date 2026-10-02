import { Router } from "express";
import {
	exportAnalyticsExcel,
	getAnalyticsByVillage,
	getOverviewAnalytics,
} from "../controllers/analytics.controller";
import {
	authenticateToken,
	authorizeVillageScope,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken, authorizeVillageScope);

// GET /api/analytics/overview
router.get("/overview", getOverviewAnalytics);

// GET /api/analytics/by-village
router.get("/by-village", getAnalyticsByVillage);

// GET /api/analytics/export-comparison
router.get("/export-comparison", exportAnalyticsExcel);

export default router;
