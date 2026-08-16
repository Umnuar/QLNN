import { Router } from 'express';
import { getVillages } from '../controllers/village.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Danh sách thôn công khai sau khi đăng nhập
router.get('/', authenticateToken, getVillages);

export default router;
