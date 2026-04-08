import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    futsalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FutsalGround',
        required: true
    },
    date: {
        type: Date,
        required: true // YYYY-MM-DD format ideally at midnight time
    },
    startTime: {
        type: String,
        required: true // e.g., '10:00'
    },
    endTime: {
        type: String,
        required: true // e.g., '11:00'
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
        default: 'PENDING'
    }
}, { timestamps: true });

// Prevent double booking at the database level for non-cancelled bookings
bookingSchema.index(
    { futsalId: 1, date: 1, startTime: 1 }, 
    { unique: true, partialFilterExpression: { status: { $ne: 'CANCELLED' } } }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
