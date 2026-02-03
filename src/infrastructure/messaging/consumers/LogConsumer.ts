import type { Channel, ConsumeMessage } from 'amqplib';

import type { UseCase } from '../../../application/ports/driving/UseCase.js';
import { Log } from '../../../domain/Log.js';
import type { LogLevel } from '../../../domain/LogLevel.js';
import { logger } from '../../logging/logger.js';

export class LogConsumer {
    constructor(
        private readonly channel: Channel,
        private readonly createLogUseCase: UseCase<Log, void>
    ) {}

    async start(queueName: string): Promise<void> {
        await this.channel.assertQueue(queueName, { durable: true });
        
        logger.info(`👂 Listening for logs on queue: ${queueName}`);

        await this.channel.consume(queueName, this.handleMessage.bind(this));
    }

    private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
        if (!msg) return;

        try {
            const content = JSON.parse(msg.content.toString());

            // Transformation de la donnée brute RabbitMQ vers l'Entité de Domaine
            // On utilise le Builder qui s'occupe de la validation via l'entité Log
            const logEntry = Log.Builder
                .service(content.service)
                .level(content.level as LogLevel)
                .message(content.message)
                .timestamp(content.timestamp ? new Date(content.timestamp) : new Date())
                .payload(content.payload || {})
                .traceId(content.traceId)
                .build();

            await this.createLogUseCase.execute(logEntry);
            
            this.channel.ack(msg);
        } catch (error) {
            logger.error({ error, msgContent: msg.content.toString() }, 'Failed to process log message from RabbitMQ');
            
            // Stratégie de rejet :
            // false = ne pas requeue (dlq ou poubelle). 
            // Si le message est malformé, le requeue ferait une boucle infinie.
            this.channel.nack(msg, false, false);
        }
    }
}
