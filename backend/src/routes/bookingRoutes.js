import express from 'express';
import { 
    createBooking, 
    getBookings, 
    updateBookingStatus,
    getSlots
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();


router.get('/slots', getSlots);

router.use(protect); 

router.route('/')
    .get(getBookings)
    .post(authorize('CUSTOMER', 'OWNER', 'ADMIN'), createBooking); 

router.put('/:id/status', authorize('OWNER', 'ADMIN'), updateBookingStatus);

export default router;
