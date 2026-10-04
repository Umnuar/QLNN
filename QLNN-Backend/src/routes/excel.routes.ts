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
const excelFileFilter = (
	req: any,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedExtensions = [".xlsx", ".xls", ".csv"];
	const ext = file.originalname
		.toLowerCase()
		.slice(file.originalname.lastIndexOf("."));
	if (!allowedExtensions.includes(ext)) {
		return cb(
			new Error("Chỉ chấp nhận tệp định dạng Excel hoặc CSV (.xlsx, .xls, .csv)"),
		);
	}
	cb(null, true);
};

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
	fileFilter: excelFileFilter,
});

router.use(authenticateToken, authorizeVillageScope);

// POST /api/excel/preview
router.post(
	"/preview",
	(req, res, next) => {
		upload.single("file")(req, res, (err) => {
			if (err) {
				return res.status(400).json({ error: err.message });
			}
			next();
		});
	},
	previewExcel,
);

// POST /api/excel/import
router.post(
	"/import",
	(req, res, next) => {
		upload.single("file")(req, res, (err) => {
			if (err) {
				return res.status(400).json({ error: err.message });
			}
			next();
		});
	},
	importExcel,
);

// GET /api/excel/export
router.post("/export", exportExcel);

export default router;
