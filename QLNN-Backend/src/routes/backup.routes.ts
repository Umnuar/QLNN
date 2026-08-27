import { Router, Response, NextFunction } from 'express';
import { exportDatabase, restoreDatabase } from '../controllers/backup.controller';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Chỉ có quyền Admin mới được sao lưu cơ sở dữ liệu.' });
    return;
  }
  next();
};

router.get('/export', authenticateToken, authorizeAdmin, exportDatabase);


router.post('/restore', authenticateToken, restoreDatabase);

export default router;
