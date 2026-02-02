import type { Server } from 'node:http';

import { MongoConnection } from '../infrastructure/database/MongoConnection.js';
import {MongoLogRepository} from '../infrastructure/database/repositories/MongoLogRepository.js';
import { logger } from '../infrastructure/logging/logger.js';
import { LogConsumer } from '../infrastructure/messaging/consumers/LogConsumer.js';
import { RabbitMQConnection } from '../infrastructure/messaging/RabbitMQConnection.js';
import {LogController} from '../infrastructure/web/LogController.js';
import {createLogRouter} from '../infrastructure/web/routes/LogRoutes.js';
import { config } from '../shared/config.js';
import { app, errorHandler } from './app.js';
import { CreateLogUseCase } from './use-cases/CreateLogUseCase.js';
import {GetLogsUseCase} from './use-cases/GetLogsUseCase.js';

async function bootstrap() {
    let server: Server;
    const mongoConnection = new MongoConnection();
    const rabbitConnection = new RabbitMQConnection();

    try {
        await mongoConnection.connect(config.mongo.uri);
        await rabbitConnection.connect(config.rabbit.uri);
        
        const logRepository = new MongoLogRepository();
        const rabbitChannel = rabbitConnection.getChannel();

        const getLogsUseCase = new GetLogsUseCase(logRepository);
        const createLogUseCase = new CreateLogUseCase(logRepository);

        const logController = new LogController(getLogsUseCase);
        const logConsumer = new LogConsumer(rabbitChannel, createLogUseCase);

        app.use('/api/v1/logs', createLogRouter(logController));
        app.use(errorHandler);
        
        await logConsumer.start('brc_logs_queue');

        server = app.listen(config.port, () => {
            logger.info(`Server ready on port ${config.port} [${config.nodeEnv}]`);
            logger.info(`Swagger docs: http://localhost:${config.port}/docs`);
        });

        server.on('error', (err: Error) => {
            logger.fatal({ err }, 'Server failed to start');
            process.exit(1);
        });

        setupGracefulShutdown(server, mongoConnection, rabbitConnection);

    } catch (err) {
        logger.fatal({ err }, 'Uncaught exception during bootstrap');
        process.exit(1);
    }
}

/**
 * Gère la fermeture propre des ressources
 * @param server - Instance du serveur HTTP à fermer
 * @param mongoConnection - Instance de la connexion MongoDB
 * @param rabbitConnection - Instance de la connexion RabbitMQ
 */
function setupGracefulShutdown(server: Server, mongoConnection: MongoConnection, rabbitConnection: RabbitMQConnection) {
    const signals = ['SIGTERM', 'SIGINT'] as const;

    signals.forEach((signal) => {
        process.on(signal, () => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed.');

                try {
                    await Promise.all([
                        mongoConnection.disconnect(),
                        rabbitConnection.disconnect()
                    ]);
                    logger.info('Infrastructure connections closed.');
                    
                    logger.info('Shutdown complete. Safe to exit.');
                    process.exit(0);
                } catch (err) {
                    logger.error({ err }, 'Error during resource cleanup');
                    process.exit(1);
                }
            });

            setTimeout(() => {
                logger.error('Shutdown timed out, forcing exit.');
                process.exit(1);
            }, 10000).unref();
        });
    });
}

await bootstrap();
