import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';

import futsalRoutes from './routes/futsalRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); 


app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'FutsalKhelum API is running!' });
});


app.use('/api/auth', authRoutes);
app.use('/api/futsals', futsalRoutes);
app.use('/api/bookings', bookingRoutes);


app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Route not found' });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

export default app;
