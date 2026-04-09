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
        required: true 
    },
    startTime: {
        type: String,
        required: true 
    },
    endTime: {
        type: String,
        required: true 
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


bookingSchema.index(
    { futsalId: 1, date: 1, startTime: 1 }, 
    { unique: true, partialFilterExpression: { status: { $ne: 'CANCELLED' } } }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
