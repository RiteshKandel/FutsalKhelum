import mongoose from 'mongoose';
import process from 'process';
import fs from 'fs';
import Booking from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futsal').then(async () => {
    const bs = await Booking.find({ date: new Date('2026-04-08T00:00:00.000Z') });
    fs.writeFileSync('bookings.json', JSON.stringify(bs, null, 2));
    process.exit(0);
});
