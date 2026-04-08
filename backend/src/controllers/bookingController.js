import Booking from '../models/Booking.js';
import FutsalGround from '../models/FutsalGround.js';

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private (Customer, Owner)
export const createBooking = async (req, res, next) => {
    try {
        const { futsalId, date, startTime, endTime } = req.body;
        
        // Date validation
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 21); // 3 weeks
        maxDate.setHours(23, 59, 59, 999);

        if (bookingDate < today) {
            return res.status(400).json({ status: 'error', message: 'Cannot book in the past' });
        }

        // If booking for today, check if startTime is in the past
        if (bookingDate.getTime() === today.getTime()) {
            const now = new Date();
            const [startHour, startMin] = startTime.split(':').map(Number);
            const bookingTimeAsDate = new Date();
            bookingTimeAsDate.setHours(startHour, startMin, 0, 0);

            if (bookingTimeAsDate < now) {
                return res.status(400).json({ status: 'error', message: 'Cannot book a slot that has already passed today' });
            }
        }

        if (bookingDate > maxDate) {
            return res.status(400).json({ status: 'error', message: 'Bookings are only allowed up to 3 weeks in advance' });
        }
        
        const futsal = await FutsalGround.findById(futsalId);
        if (!futsal) {
            return res.status(404).json({ status: 'error', message: 'Futsal ground not found' });
        }

        const price = futsal.pricePerHour;

        // Auto-confirm if owner is booking their own futsal
        const isOwnerSelfBooking = futsal.ownerId.toString() === req.user.id;

        const booking = new Booking({
            userId: req.user.id,
            futsalId,
            date,
            startTime,
            endTime,
            price,
            status: isOwnerSelfBooking ? 'CONFIRMED' : 'PENDING'
        });

        await booking.save();

        res.status(201).json({
            status: 'success',
            message: isOwnerSelfBooking ? 'Slot blocked successfully (auto-confirmed).' : 'Booking submitted for approval.',
            data: booking
        });
    } catch (error) {
        console.error('------- MONGO ERROR IN CREATEBOOKING -------');
        console.error(error);
        console.error('------------------------------------------');
        // Handle MongoDB duplicate key error for our compound unique index
        if (error.code === 11000) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'This time slot is already booked for the selected date.' 
            });
        }
        next(error);
    }
};

// @desc    Get bookings for user or owner
// @route   GET /api/v1/bookings
// @access  Private
export const getBookings = async (req, res, next) => {
    try {
        let query = {};
        
        if (req.user.role === 'CUSTOMER') {
            query.userId = req.user.id;
        } else if (req.user.role === 'OWNER') {
            // Find all futsals owned by this user
            const futsals = await FutsalGround.find({ ownerId: req.user.id });
            const futsalIds = futsals.map(f => f._id);
            query.futsalId = { $in: futsalIds };
        } // Admin sees all

        const bookings = await Booking.find(query)
            .populate('futsalId', 'name')
            .populate('userId', 'name email phone');

        res.status(200).json({
            status: 'success',
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id/status
// @access  Private (Owner, Admin)
export const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ status: 'error', message: 'Booking not found' });
        }

        // Verify owner owns this booking's futsal ground
        if (req.user.role === 'OWNER') {
            const futsal = await FutsalGround.findById(booking.futsalId);
            if (futsal.ownerId.toString() !== req.user.id) {
                return res.status(403).json({ status: 'error', message: 'Not authorized to update this booking' });
            }
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            status: 'success',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get available slots for a futsal on a given date
// @route   GET /api/v1/bookings/slots
// @access  Public
export const getSlots = async (req, res, next) => {
    try {
        const { futsalId, date } = req.query;

        if (!futsalId || !date) {
            return res.status(400).json({ status: 'error', message: 'Please provide futsalId and date' });
        }

        // Date validation
        const queryDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 21); // 3 weeks
        maxDate.setHours(23, 59, 59, 999);

        if (queryDate < today) {
            return res.status(200).json({ status: 'success', data: [], message: 'Cannot view slots for past dates.' });
        }

        if (queryDate > maxDate) {
            return res.status(200).json({ status: 'success', data: [], message: 'Slots can only be viewed up to 3 weeks in advance.' });
        }

        const futsal = await FutsalGround.findById(futsalId);
        if (!futsal) {
            return res.status(404).json({ status: 'error', message: 'Futsal ground not found' });
        }

        const openHour = parseInt(futsal.operatingHours?.open?.split(':')[0] || '6');
        const closeHour = parseInt(futsal.operatingHours?.close?.split(':')[0] || '22');

        // Get the day label for special pricing
        const dateObj = new Date(date);
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayLabel = dayLabels[dateObj.getUTCDay()];

        // Check if this day is an operating day
        if (futsal.operatingDays && !futsal.operatingDays.includes(dayLabel)) {
            return res.status(200).json({ status: 'success', data: [], message: 'Futsal is closed on this day.' });
        }

        // Get existing bookings for this date (only non-cancelled)
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existingBookings = await Booking.find({
            futsalId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'CANCELLED' }
        });

        const bookedSlots = new Set(existingBookings.map(b => b.startTime));

        // Generate all slots
        const slots = [];
        for (let hour = openHour; hour < closeHour; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
            
            // Check for special pricing
            let price = futsal.pricePerHour;
            if (futsal.specialPricing && futsal.specialPricing.length > 0) {
                for (const sp of futsal.specialPricing) {
                    const spStart = parseInt(sp.startTime?.split(':')[0] || '0');
                    const spEnd = parseInt(sp.endTime?.split(':')[0] || '0');
                    const matchesDay = sp.day === 'ALL' || sp.day === dayLabel;
                    if (matchesDay && hour >= spStart && hour < spEnd) {
                        price = sp.pricePerHour;
                        break;
                    }
                }
            }

            // Check if slot is in the past for today
            const isPast = queryDate.getTime() === today.getTime() && (hour < new Date().getHours());

            slots.push({
                startTime,
                endTime,
                price,
                isAvailable: !bookedSlots.has(startTime) && !isPast
            });
        }

        res.status(200).json({
            status: 'success',
            day: dayLabel,
            data: slots
        });
    } catch (error) {
        next(error);
    }
};
