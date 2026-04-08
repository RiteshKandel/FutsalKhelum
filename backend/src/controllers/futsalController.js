import FutsalGround from '../models/FutsalGround.js';
import User from '../models/User.js';


// @desc    Create new futsal ground
// @route   POST /api/v1/futsals
// @access  Private (Owner)
export const createFutsal = async (req, res, next) => {
    try {
        req.body.ownerId = req.user.id;
        
        // ensure owner doesn't fake activation
        req.body.isVerified = false;

        // Ensure location is valid GeoJSON Point
        if (req.body.lng && req.body.lat) {
            req.body.location = {
                type: 'Point',
                coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
            };
        }

        const futsal = await FutsalGround.create(req.body);

        res.status(201).json({
            status: 'success',
            data: futsal
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all verified futsal grounds (for customers)
// @route   GET /api/v1/futsals
// @access  Public
export const getFutsals = async (req, res, next) => {
    try {
        const futsals = await FutsalGround.find({ isVerified: true, isListed: true });

        res.status(200).json({
            status: 'success',
            count: futsals.length,
            data: futsals
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get nearby futsals (GeoJSON)
// @route   GET /api/v1/futsals/nearby
// @access  Public
export const getNearbyFutsals = async (req, res, next) => {
    try {
        const { lng, lat, distance = 10 } = req.query; // distance in kilometers

        if (!lng || !lat) {
            return res.status(400).json({ status: 'error', message: 'Please provide longitude and latitude' });
        }

        const futsals = await FutsalGround.find({
            isVerified: true,
            isListed: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance) * 1000 // Convert to meters
                }
            }
        });

        res.status(200).json({
            status: 'success',
            count: futsals.length,
            data: futsals
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single futsal ground
// @route   GET /api/v1/futsals/:id
// @access  Public
export const getFutsal = async (req, res, next) => {
    try {
        const futsal = await FutsalGround.findById(req.params.id).populate('ownerId', 'name email');
        
        if (!futsal) {
            return res.status(404).json({ status: 'error', message: 'Futsal ground not found' });
        }

        res.status(200).json({
            status: 'success',
            data: futsal
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify futsal ground
// @route   PUT /api/v1/futsals/:id/verify
// @access  Private (Admin)
export const verifyFutsal = async (req, res, next) => {
    try {
        const { lat, lng } = req.body;

        const updateData = { isVerified: true };

        // Admin can set/correct coordinates during verification
        if (lat && lng) {
            updateData.location = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        const futsal = await FutsalGround.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!futsal) {
            return res.status(404).json({ status: 'error', message: 'Futsal ground not found' });
        }

        // Sync: Approve the owner of this ground
        await User.findByIdAndUpdate(futsal.ownerId, { isApproved: true });

        res.status(200).json({
            status: 'success',
            data: futsal
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending futsal grounds
// @route   GET /api/v1/futsals/pending
// @access  Private (Admin)
export const getPendingFutsals = async (req, res, next) => {
    try {
        const futsals = await FutsalGround.find({ isVerified: false }).populate('ownerId', 'name email phone');

        res.status(200).json({
            status: 'success',
            count: futsals.length,
            data: futsals
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get owner's futsal ground
// @route   GET /api/v1/futsals/my
// @access  Private (Owner)
export const getMyFutsals = async (req, res, next) => {
    try {
        const futsal = await FutsalGround.findOne({ ownerId: req.user.id });

        if (!futsal) return res.status(404).json({ status: 'error', message: 'No futsal ground found for this owner.' });

        res.status(200).json({
            status: 'success',
            data: futsal
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update owner's futsal ground
// @route   PUT /api/v1/futsals/my
// @access  Private (Owner)
export const updateMyFutsal = async (req, res, next) => {
    try {
        const { pricePerHour, facilities, description, name, operatingHours, operatingDays, specialPricing, isListed } = req.body;

        const updateData = {};
        if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour;
        if (facilities !== undefined) updateData.facilities = facilities;
        if (description !== undefined) updateData.description = description;
        if (name !== undefined) updateData.name = name;
        if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
        if (operatingDays !== undefined) updateData.operatingDays = operatingDays;
        if (specialPricing !== undefined) updateData.specialPricing = specialPricing;
        if (isListed !== undefined) updateData.isListed = isListed;

        const futsal = await FutsalGround.findOneAndUpdate(
            { ownerId: req.user.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!futsal) return res.status(404).json({ status: 'error', message: 'No futsal ground found for this owner.' });

        res.status(200).json({
            status: 'success',
            data: futsal
        });
    } catch (error) {
        next(error);
    }
};
