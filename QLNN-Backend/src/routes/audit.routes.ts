import { Router } from "express";
import { getAuditLogs } from "../controllers/audit.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);
router.get("/", getAuditLogs);
router.get("/:village_id", getAuditLogs);

export default router;
