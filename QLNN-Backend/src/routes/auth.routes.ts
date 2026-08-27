import { Router } from 'express';
import { login, getMe, refresh } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticateToken, getMe);

export default router;
