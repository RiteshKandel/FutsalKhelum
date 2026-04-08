import mongoose from 'mongoose';
import process from 'process';
import dotenv from 'dotenv';
dotenv.config();

const drop = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futsal');
        await mongoose.connection.collection('bookings').dropIndex('futsalId_1_date_1_startTime_1');
        console.log('Successfully dropped old index via native driver.');
    } catch (e) {
        if (e.code === 27) console.log('Index not found, continuing...');
        else console.error('Error dropping:', e);
    }
    process.exit(0);
};
drop();
