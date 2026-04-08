import mongoose from 'mongoose';
import process from 'process';
import Booking from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

const sync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futsal');
        
        try {
            await Booking.collection.dropIndex('futsalId_1_date_1_startTime_1');
            console.log('Old index dropped successfully.');
        } catch(e) {
            console.log('Old index drop error (maybe it didn\'t exist):', e.code);
        }
        
        await Booking.syncIndexes();
        console.log('New indexes synchronized successfully.');
    } catch (e) {
        console.error('Error syncing indexes:', e);
    }
    process.exit(0);
};
sync();
