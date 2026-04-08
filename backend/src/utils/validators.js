import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
        email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
        role: z.enum(['CUSTOMER', 'OWNER'], { required_error: 'Role is required and must be either CUSTOMER or OWNER' })
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters')
    })
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
        otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be 6 digits')
    })
});
