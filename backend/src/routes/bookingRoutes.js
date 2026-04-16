import express from 'express';
import { 
    createBooking, 
    getBookings, 
    updateBookingStatus,
    getSlots,
    getRevenueForecast
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/slots', getSlots);

router.use(protect); 

router.get('/forecast', authorize('OWNER', 'ADMIN'), getRevenueForecast);

router.route('/')
    .get(getBookings)
    .post(authorize('CUSTOMER', 'OWNER', 'ADMIN'), createBooking); 

router.put('/:id/status', authorize('OWNER', 'ADMIN'), updateBookingStatus);

export default router;
