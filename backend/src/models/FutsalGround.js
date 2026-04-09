import mongoose from 'mongoose';

const futsalGroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Futsal name is required'],
        trim: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{
        type: String, 
    }],
    pricePerHour: {
        type: Number,
        required: [true, 'Price per hour is required']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    },
    address: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false 
    },
    facilities: [{
        type: String
    }],
    description: {
        type: String
    },
    operatingHours: {
        open: { type: String, default: '06:00' },
        close: { type: String, default: '22:00' }
    },
    operatingDays: {
        type: [String],
        default: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    specialPricing: [{
        label: { type: String },       
        startTime: { type: String },    
        endTime: { type: String },      
        day: { type: String },          
        pricePerHour: { type: Number }
    }],
    isListed: {
        type: Boolean,
        default: false 
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


futsalGroundSchema.index({ location: '2dsphere' });

const FutsalGround = mongoose.model('FutsalGround', futsalGroundSchema);
export default FutsalGround;
