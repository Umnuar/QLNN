import { Router } from 'express';
import { getOverviewAnalytics, getAnalyticsByVillage } from '../controllers/analytics.controller';
import { authenticateToken, authorizeVillageScope } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken, authorizeVillageScope);

// GET /api/analytics/overview
router.get('/overview', getOverviewAnalytics);

// GET /api/analytics/by-village
router.get('/by-village', getAnalyticsByVillage);

export default router;
