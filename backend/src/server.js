import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './utils/db.js';
import { initSocket } from './utils/socket.js';
import logger from './utils/logger.js';

dotenv.config();

const server = http.createServer(app);


initSocket(server);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
