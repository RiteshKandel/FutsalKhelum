import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import FutsalGround from '../models/FutsalGround.js';
import { sendEmail } from '../services/email.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
    const { name, email, password, role, phone, futsalName, address, lat, lng } = req.body;

    const existingUser = await User.findOne({ email });
    let user;

    if (existingUser) {
        if (existingUser.isVerified) {
            return res.status(400).json({ status: 'error', message: 'User already exists and is verified. Please login.' });
        }
        
        
        existingUser.name = name;
        existingUser.password = password;
        existingUser.role = role;
        existingUser.phone = phone;
        existingUser.isApproved = role === 'OWNER' ? false : true;
        await existingUser.save();
        user = existingUser;
    } else {
        user = await User.create({
            name,
            email,
            password,
            role,
            phone,
            isVerified: false,
            isApproved: role === 'OWNER' ? false : true
        });
    }

    
    if (role === 'OWNER') {
        const existingGround = await FutsalGround.findOne({ ownerId: user._id });
        if (!existingGround) {
            await FutsalGround.create({
                name: futsalName || `${name}'s Futsal`,
                ownerId: user._id,
                address: address || 'TBD',
                location: {
                    type: 'Point',
                    coordinates: [lng || 0, lat || 0]
                },
                pricePerHour: 0, 
                isVerified: false
            });
        } else {
            
            existingGround.name = futsalName || existingGround.name;
            existingGround.address = address || existingGround.address;
            existingGround.location.coordinates = [lng || existingGround.location.coordinates[0], lat || existingGround.location.coordinates[1]];
            await existingGround.save();
        }
    }

    const otp = generateOtp();
    
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    const message = `Welcome to FutsalKhelum! Your verification OTP is: ${otp}. It will expire in 5 minutes.`;
    
    
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'FutsalKhelum Verification OTP',
            message
        });
    } catch (emailError) {
        console.error('Email sending failed, but user was created:', emailError.message);
    }

    res.status(201).json({
        status: 'success',
        message: 'Registration successful. Please check your email for the OTP to verify your account.',
        data: { id: user._id, email: user.email, role: user.role }
    });
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    
    if (user.isVerified) {
        return res.status(400).json({ status: 'error', message: 'User already verified' });
    }

    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) return res.status(400).json({ status: 'error', message: 'OTP expired or not found' });

    const isMatch = await otpRecord.verifyOtp(otp);
    if (!isMatch) return res.status(400).json({ status: 'error', message: 'Invalid OTP' });

    user.isVerified = true;
    await user.save();
    
    
    await OTP.deleteMany({ email });

    const token = generateToken(user._id);

    res.status(200).json({
        status: 'success',
        message: 'Email successfully verified',
        token,
        data: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: true, isApproved: user.isApproved }
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    if (!user.isVerified) {
        return res.status(401).json({ status: 'error', message: 'Please verify your email first' });
    }

    if (user.role === 'OWNER' && !user.isApproved) {
        return res.status(403).json({ status: 'error', message: 'Your account is pending admin approval' });
    }

    const token = generateToken(user._id);
    
    
    const userWithoutPassword = await User.findById(user._id);

    res.status(200).json({
        status: 'success',
        token,
        data: userWithoutPassword
    });
};


export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        
        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;
        
        let user = await User.findOne({ email }).select('+password');
        
        if (user) {
            // Existing user, link googleId if it's not already linked
            if (!user.googleId) {
                user.googleId = sub;
                // Since this user had a local account, we don't necessarily overwrite the authProvider to 'google'
                // but we add the googleId to mark that they can also login with google.
                await user.save();
            }
        } else {
            // Create a new user for Google login
            user = await User.create({
                name,
                email,
                googleId: sub,
                authProvider: 'google',
                isVerified: true, // Google emails are already verified
                role: 'CUSTOMER' // Default role for new signups via Google
            });
        }
        
        // Check for admin approval if they happen to be an OWNER
        if (user.role === 'OWNER' && !user.isApproved) {
            return res.status(403).json({ status: 'error', message: 'Your account is pending admin approval' });
        }
        
        const jwtToken = generateToken(user._id);
        const userWithoutPassword = await User.findById(user._id);
        
        res.status(200).json({
            status: 'success',
            token: jwtToken,
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ status: 'error', message: 'Invalid Google token' });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update profile' });
    }
};
