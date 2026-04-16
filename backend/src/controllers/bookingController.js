import Booking from '../models/Booking.js';
import FutsalGround from '../models/FutsalGround.js';




export const createBooking = async (req, res, next) => {
    try {
        const { futsalId, date, startTime, endTime } = req.body;
        
        
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 21); 
        maxDate.setHours(23, 59, 59, 999);

        if (bookingDate < today) {
            return res.status(400).json({ status: 'error', message: 'Cannot book in the past' });
        }

        
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
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'This time slot is already booked for the selected date.' 
            });
        }
        next(error);
    }
};




export const getBookings = async (req, res, next) => {
    try {
        let query = {};
        
        if (req.user.role === 'CUSTOMER') {
            query.userId = req.user.id;
        } else if (req.user.role === 'OWNER') {
            
            const futsals = await FutsalGround.find({ ownerId: req.user.id });
            const futsalIds = futsals.map(f => f._id);
            query.futsalId = { $in: futsalIds };
        } 

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




export const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ status: 'error', message: 'Booking not found' });
        }

        
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




export const getSlots = async (req, res, next) => {
    try {
        const { futsalId, date } = req.query;

        if (!futsalId || !date) {
            return res.status(400).json({ status: 'error', message: 'Please provide futsalId and date' });
        }

        
        const queryDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 21); 
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

        
        const dateObj = new Date(date);
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayLabel = dayLabels[dateObj.getUTCDay()];

        
        if (futsal.operatingDays && !futsal.operatingDays.includes(dayLabel)) {
            return res.status(200).json({ status: 'success', data: [], message: 'Futsal is closed on this day.' });
        }

        
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

        
        const slots = [];
        for (let hour = openHour; hour < closeHour; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
            
            
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

// ==========================================
// AI REVENUE PULSE FORECAST
// ==========================================
export const getRevenueForecast = async (req, res, next) => {
    try {
        const { futsalId } = req.query;
        if (!futsalId) {
            return res.status(400).json({ status: 'error', message: 'Futsal ID is required' });
        }

        const futsal = await FutsalGround.findById(futsalId);
        if (!futsal) {
            return res.status(404).json({ status: 'error', message: 'Futsal not found' });
        }
        
        if (futsal.ownerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ status: 'error', message: 'Not authorized' });
        }

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 28);
        startDate.setHours(0, 0, 0, 0);

        const pastBookings = await Booking.find({
            futsalId,
            date: { $gte: startDate, $lte: endDate },
            status: { $in: ['CONFIRMED', 'PENDING'] } 
        });

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const revenueByDay = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
        const countsByDay = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

        pastBookings.forEach(b => {
            const dayStr = days[new Date(b.date).getUTCDay()];
            revenueByDay[dayStr] += b.price || 0;
            countsByDay[dayStr] += 1;
        });

        const avgRevenue = Object.keys(revenueByDay).map(day => ({
            day,
            avg: revenueByDay[day] / 4 
        }));

        let forecastList = [];
        let lowestDay = { day: null, val: Infinity };
        let highestDay = { day: null, val: -Infinity };
        let totalForecast = 0;

        for(let i=1; i<=7; i++) {
            let nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + i);
            let dayName = days[nextDate.getDay()];
            
            let baseAvg = avgRevenue.find(a => a.day === dayName).avg || 0;
            
            let projected = Math.round(baseAvg * (0.95 + Math.random() * 0.1));
            
            if (baseAvg === 0 && Math.random() > 0.8) projected = futsal.pricePerHour;
            
            if (projected < lowestDay.val) lowestDay = { day: dayName, val: projected };
            if (projected > highestDay.val) highestDay = { day: dayName, val: projected };
            totalForecast += projected;

            forecastList.push({
                date: nextDate.toISOString().split('T')[0],
                day: dayName,
                projectedRevenue: projected,
                historicalAvg: Math.round(baseAvg)
            });
        }

        let avgPerDay = totalForecast / 7;
        let insights = [];
        
        if (totalForecast === 0) {
            insights.push("INSUFFICIENT DATA: No historical bookings found to form a statistically significant baseline calculation. Awaiting further operational data.");
        } else {
            insights.push(`PROJECTION UPDATE: Weekly tactical revenue projected at Rs. ${totalForecast.toLocaleString()}.`);
            if (lowestDay.val < (avgPerDay * 0.7)) {
                insights.push(`TACTICAL ALERT: Significant velocity drop projected on ${lowestDay.day}. Consider initiating a 'Tactical Promotion' (Discount Override) via Special Pricing controls.`);
            }
            if (highestDay.val > (avgPerDay * 1.3)) {
                insights.push(`SURGE WARNING: Maximum capacity anticipated on ${highestDay.day}. Ensure operational readiness and prep field surface accordingly.`);
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                forecast: forecastList,
                insights
            }
        });

    } catch(err) {
        next(err);
    }
};
