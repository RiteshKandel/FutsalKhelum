import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './src/models/Booking.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futsal');

const run = async () => {
    const bookings = await Booking.find({});
    console.log(JSON.stringify(bookings, null, 2));
    process.exit(0);
};

run();
