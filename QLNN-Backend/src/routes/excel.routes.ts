import { Router } from 'express';
import multer from 'multer';
import { importExcel, exportExcel } from '../controllers/excel.controller';
import { authenticateToken, authorizeVillageScope } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.use(authenticateToken, authorizeVillageScope);

// POST /api/excel/import
router.post('/import', upload.single('file'), importExcel);

// GET /api/excel/export
router.get('/export', exportExcel);

export default router;
