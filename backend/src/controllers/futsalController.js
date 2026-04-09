import FutsalGround from '../models/FutsalGround.js';
import User from '../models/User.js';





export const createFutsal = async (req, res, next) => {
    try {
        req.body.ownerId = req.user.id;
        
        
        req.body.isVerified = false;

        
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




export const getFutsals = async (req, res, next) => {
    try {
        const futsals = await FutsalGround.find({ isVerified: true, isListed: true, isBlocked: { $ne: true } });

        res.status(200).json({
            status: 'success',
            count: futsals.length,
            data: futsals
        });
    } catch (error) {
        next(error);
    }
};




export const getNearbyFutsals = async (req, res, next) => {
    try {
        const { lng, lat, distance = 10 } = req.query; 

        if (!lng || !lat) {
            return res.status(400).json({ status: 'error', message: 'Please provide longitude and latitude' });
        }

        const futsals = await FutsalGround.find({
            isVerified: true,
            isListed: true,
            isBlocked: { $ne: true },
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance) * 1000 
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




export const verifyFutsal = async (req, res, next) => {
    try {
        const { lat, lng } = req.body;

        const updateData = { isVerified: true };

        
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

        
        await User.findByIdAndUpdate(futsal.ownerId, { isApproved: true });

        res.status(200).json({
            status: 'success',
            data: futsal
        });
    } catch (error) {
        next(error);
    }
};




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

export const getAdminFutsals = async (req, res, next) => {
    try {
        const futsals = await FutsalGround.find({ isVerified: true }).populate('ownerId', 'name email phone');

        res.status(200).json({
            status: 'success',
            count: futsals.length,
            data: futsals
        });
    } catch (error) {
        next(error);
    }
};

export const toggleBlockFutsal = async (req, res, next) => {
    try {
        const futsal = await FutsalGround.findById(req.params.id);
        
        if (!futsal) {
            return res.status(404).json({ status: 'error', message: 'Futsal ground not found' });
        }

        futsal.isBlocked = !futsal.isBlocked;
        await futsal.save();

        res.status(200).json({
            status: 'success',
            message: `Futsal has been ${futsal.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
            data: futsal
        });
    } catch (error) {
        next(error);
    }
};
