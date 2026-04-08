import mongoose from 'mongoose';
import process from 'process';
import fs from 'fs';
import Booking from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futsal').then(async () => {
    const bs = await Booking.find({ startTime: '16:00' });
    fs.writeFileSync('all1600.json', JSON.stringify(bs, null, 2));
    process.exit(0);
});
