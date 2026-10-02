import { Router } from "express";
import multer from "multer";
import {
	exportExcel,
	importExcel,
	previewExcel,
} from "../controllers/excel.controller";
import {
	authenticateToken,
	authorizeVillageScope,
} from "../middlewares/auth.middleware";

const router = Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.use(authenticateToken, authorizeVillageScope);

// POST /api/excel/preview
router.post("/preview", upload.single("file"), previewExcel);

// POST /api/excel/import
router.post("/import", upload.single("file"), importExcel);

// GET /api/excel/export
router.post("/export", exportExcel);

export default router;
