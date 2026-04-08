import mongoose from 'mongoose';
import process from 'process';
import Booking from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futsal');
        const booking = new Booking({
            userId: '69d51587a208bb61d5ff40ca',
            futsalId: '69d51587a208bb61d5ff40cb',
            date: '2026-04-09',
            startTime: '16:00',
            endTime: '17:00',
            price: 1000,
            status: 'PENDING'
        });
        await booking.save();
        console.log('Saved successfully!');
    } catch (e) {
        console.log('Error Code:', e.code);
        console.log('Error Message:', e.message);
    }
    process.exit(0);
};
test();
