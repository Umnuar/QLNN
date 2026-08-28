import { Router } from 'express';
import {
  getHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  bulkDeleteHouseholds
} from '../controllers/household.controller';
import { authenticateToken, authorizeVillageScope } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả các routes hộ nông nghiệp đều yêu cầu xác thực SSO và lọc theo Thôn
router.use(authenticateToken, authorizeVillageScope);

router.get('/', getHouseholds);
router.get('/:id', getHouseholdById);
router.post('/', createHousehold);
router.put('/:id', updateHousehold);
router.delete('/', bulkDeleteHouseholds);
router.delete('/:id', deleteHousehold);

export default router;
