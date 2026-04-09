import express from 'express';
import { 
    createFutsal, 
    getFutsals, 
    getNearbyFutsals, 
    getFutsal,
    verifyFutsal,
    getPendingFutsals,
    getMyFutsals,
    updateMyFutsal
} from '../controllers/futsalController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
    .get(getFutsals)
    .post(protect, authorize('OWNER', 'ADMIN'), createFutsal);

router.get('/nearby', getNearbyFutsals);


router.get('/pending', protect, authorize('ADMIN'), getPendingFutsals);
router.route('/my')
    .get(protect, authorize('OWNER'), getMyFutsals)
    .put(protect, authorize('OWNER'), updateMyFutsal);

router.route('/:id')
    .get(getFutsal);

router.put('/:id/verify', protect, authorize('ADMIN'), verifyFutsal);

export default router;
