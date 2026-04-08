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
        type: String, // URLs to images
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
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    address: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false // Requires admin approval to show up on the map
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
        label: { type: String },       // e.g. "Saturday Rate", "Night Game"
        startTime: { type: String },    // e.g. "18:00"
        endTime: { type: String },      // e.g. "22:00"
        day: { type: String },          // e.g. "Sat" or "ALL"
        pricePerHour: { type: Number }
    }],
    isListed: {
        type: Boolean,
        default: false // Owner flips this after completing schedule setup
    }
}, { timestamps: true });

// Index for geospatial queries
futsalGroundSchema.index({ location: '2dsphere' });

const FutsalGround = mongoose.model('FutsalGround', futsalGroundSchema);
export default FutsalGround;
