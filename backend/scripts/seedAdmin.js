import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@futsalkhelum.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists. Updating to ensure full privileges...');
            existingAdmin.role = 'ADMIN';
            existingAdmin.isVerified = true;
            existingAdmin.isApproved = true;
            await existingAdmin.save();
        } else {
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: 'adminpassword123',
                role: 'ADMIN',
                isVerified: true,
                isApproved: true
            });
            console.log('Super Admin created successfully!');
        }

        console.log('-----------------------------------');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: adminpassword123`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
