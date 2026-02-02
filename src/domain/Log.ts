import {Validator} from '../shared/utils/Validator.js';
import {LogBuilder} from './LogBuilder.js';
import {LogLevel} from './LogLevel.js';

export class Log {

    readonly service: string;
    readonly level: LogLevel;
    readonly message: string;
    readonly timestamp: Date;
    readonly payload: Record<string, unknown>;
    readonly traceId: string;

    constructor(
        service: string,
        level: LogLevel,
        message: string,
        timestamp: Date,
        payload: Record<string, unknown>,
        traceId: string,
    ) {
        this.service = Validator.string(service, 'service');
        this.level = Validator.enumValue(level, LogLevel, 'level');
        this.message = Validator.string(message, 'message');
        this.timestamp = Validator.date(timestamp, 'timestamp');
        this.payload = Validator.object(payload, 'payload');
        this.traceId = Validator.string(traceId, 'traceId');
    }

    static get Builder() {
        return new LogBuilder();
    }
}