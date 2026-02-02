import mongoose from 'mongoose';

import { logger } from '../logging/logger.js';

export class MongoConnection {
    async connect(uri: string): Promise<void> {
        try {
            await mongoose.connect(uri);
            logger.info('Connected to MongoDB');
            
            mongoose.connection.on('error', (err) => {
                logger.error({ err }, 'MongoDB connection error');
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected');
            });

        } catch (error) {
            logger.fatal({ error }, 'Could not connect to MongoDB');
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }
}
