import express from 'express';
import { 
    createBooking, 
    getBookings, 
    updateBookingStatus,
    getSlots
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public slot availability
router.get('/slots', getSlots);

router.use(protect); // All routes below require auth

router.route('/')
    .get(getBookings)
    .post(authorize('CUSTOMER', 'OWNER', 'ADMIN'), createBooking); // Owners can book for walk-ins

router.put('/:id/status', authorize('OWNER', 'ADMIN'), updateBookingStatus);

export default router;
