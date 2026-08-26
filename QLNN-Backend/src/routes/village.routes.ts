import { Router } from 'express';
import { getVillages, createVillage, updateVillage, deleteVillage } from '../controllers/village.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getVillages);

// Admin only routes
router.post('/', authenticateToken, createVillage);
router.put('/:id', authenticateToken, updateVillage);
router.delete('/:id', authenticateToken, deleteVillage);

export default router;
