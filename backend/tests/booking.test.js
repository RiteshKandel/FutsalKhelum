import assert from 'node:assert';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import FutsalGround from '../src/models/FutsalGround.js';
import jwt from 'jsonwebtoken';

const runTest = async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    try {
        console.log('1. Setting up test users...');
        const owner = await User.create({
            name: 'Owner',
            email: 'owner@test.com',
            password: 'password123',
            role: 'OWNER',
            isVerified: true,
        });

        const customer = await User.create({
            name: 'Customer',
            email: 'customer@test.com',
            password: 'password123',
            role: 'CUSTOMER',
            isVerified: true,
        });
        const customerToken = jwt.sign({ id: customer._id, role: customer.role }, process.env.JWT_SECRET);

        console.log('2. Setting up futsal...');
        const futsal = await FutsalGround.create({
            owner: owner._id,
            name: 'Test Futsal',
            address: 'Test Addr',
            location: { type: 'Point', coordinates: [85.3, 27.7] },
            pricePerHour: 1500,
        });

        const bookingData = {
            futsalId: futsal._id,
            date: '2027-01-01',
            startTime: '10:00',
            endTime: '11:00'
        };

        console.log('3. Creating first booking...');
        const res1 = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(bookingData);

        if (res1.status !== 201) throw new Error(`First booking failed: ${JSON.stringify(res1.body)}`);

        console.log('4. Attempting double booking...');
        const res2 = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(bookingData);

        if (res2.status === 201) throw new Error('Double booking was allowed!');
        
        console.log('Resulting status:', res2.status, res2.body);
        console.log('TEST PASSED: Atomic constraint caught the double booking!');
    } catch (e) {
        console.error('TEST FAILED:', e.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        await mongoServer.stop();
    }
};

runTest();

