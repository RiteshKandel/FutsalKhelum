import express from 'express';
import { 
    createFutsal, 
    getFutsals, 
    getNearbyFutsals, 
    getFutsal,
    verifyFutsal,
    getPendingFutsals,
    getMyFutsals,
    updateMyFutsal,
    getAdminFutsals,
    toggleBlockFutsal
} from '../controllers/futsalController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
    .get(getFutsals)
    .post(protect, authorize('OWNER', 'ADMIN'), createFutsal);

router.get('/nearby', getNearbyFutsals);


router.get('/pending', protect, authorize('ADMIN'), getPendingFutsals);
router.get('/admin/all', protect, authorize('ADMIN'), getAdminFutsals);
router.route('/my')
    .get(protect, authorize('OWNER'), getMyFutsals)
    .put(protect, authorize('OWNER'), updateMyFutsal);

router.route('/:id')
    .get(getFutsal);

router.put('/:id/verify', protect, authorize('ADMIN'), verifyFutsal);
router.put('/:id/toggle-block', protect, authorize('ADMIN'), toggleBlockFutsal);

export default router;
