import { Server } from 'socket.io';
import logger from './logger.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        socket.on('join_futsal_room', (futsalId) => {
            socket.join(futsalId);
            logger.info(`User joined room for futsal: ${futsalId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
