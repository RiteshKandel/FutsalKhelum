import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 
    }
});


otpSchema.pre('save', async function () {
    if (!this.isModified('otp')) return;
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
});


otpSchema.methods.verifyOtp = async function (enteredOtp) {
    return await bcrypt.compare(enteredOtp, this.otp);
};

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
