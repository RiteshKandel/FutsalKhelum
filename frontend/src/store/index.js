import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import futsalReducer from './slices/futsalSlice.js';
import bookingReducer from './slices/bookingSlice.js';

const store = configureStore({
    reducer: {
        auth: authReducer,
        futsals: futsalReducer,
        bookings: bookingReducer,
    },
});

export default store;
