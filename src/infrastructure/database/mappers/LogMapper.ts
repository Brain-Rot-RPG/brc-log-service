import { Log } from '../../../domain/Log.js';
import type { LogLevel } from '../../../domain/LogLevel.js';
import type { LogDocument } from '../models/LogDocument.js';

export class LogMapper {
    static toDomain(doc: LogDocument): Log {
        return Log.Builder
            .service(doc.service)
            .level(doc.level as LogLevel)
            .message(doc.message)
            .timestamp(doc.timestamp)
            .payload(doc.payload || {})
            .traceId(doc.traceId)
            .build();
    }

    static toPersistence(log: Log): Partial<LogDocument> {
        return {
            service: log.service,
            level: log.level,
            message: log.message,
            timestamp: log.timestamp,
            payload: log.payload,
            traceId: log.traceId,
        };
    }
}
