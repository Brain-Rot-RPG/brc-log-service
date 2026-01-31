import type { Server } from 'node:http';

import { logger } from '../infrastructure/logging/logger.js';
import { config } from '../shared/config.js';
import { app } from './app.js';

async function bootstrap() {
    let server: Server;

    try {
        server = app.listen(config.port, () => {
            logger.info(`Server ready on port ${config.port} [${config.nodeEnv}]`);
            logger.info(`Swagger docs: http://localhost:${config.port}/docs`);
        });

        server.on('error', (err: Error) => {
            logger.fatal({ err }, 'Server failed to start');
            process.exit(1);
        });

        setupGracefulShutdown(server);

    } catch (err) {
        logger.fatal({ err }, 'Uncaught exception during bootstrap');
        process.exit(1);
    }
}

/**
 * Gère la fermeture propre des ressources
 * @param server - Instance du serveur HTTP à fermer
 */
function setupGracefulShutdown(server: Server) {
    const signals = ['SIGTERM', 'SIGINT'] as const;

    signals.forEach((signal) => {
        process.on(signal, () => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed.');

                try {
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