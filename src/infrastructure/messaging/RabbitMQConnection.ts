import amqp from 'amqplib';

import { logger } from '../logging/logger.js';

export class RabbitMQConnection {
    // Le type retourné par connect() est ChannelModel, pas Connection (d'après les définitions types)
    private connection: amqp.ChannelModel | undefined;
    private channel: amqp.Channel | undefined;

    async connect(uri: string): Promise<void> {
        try {
            this.connection = await amqp.connect(uri);
            this.channel = await this.connection.createChannel();
            
            logger.info('Connected to RabbitMQ');

            this.connection.on('error', (err) => {
                logger.error({ err }, 'RabbitMQ connection error');
            });

            this.connection.on('close', () => {
                logger.warn('RabbitMQ connection closed');
            });

        } catch (error) {
            logger.fatal({ error }, 'Could not connect to RabbitMQ');
            throw error;
        }
    }

    getChannel(): amqp.Channel {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not initialized. Call connect() first.');
        }
        return this.channel;
    }

    async disconnect(): Promise<void> {
        try {
            await this.channel?.close();
            await this.connection?.close();
        } catch (error) {
            logger.error({ error }, 'Error while disconnecting RabbitMQ');
        }
    }
}
