import {Log} from './Log.js';
import type {LogLevel} from './LogLevel.js';

export class LogBuilder {

    private _service!: string;
    private _level!: LogLevel;
    private _message!: string;
    private _timestamp!: Date;
    private _payload!: Record<string, unknown>;
    private _traceId!: string;

    service(service: string): this {
        this._service = service;
        return this;
    }

    level(level: LogLevel): this {
        this._level = level;
        return this;
    }

    message(message: string): this {
        this._message = message;
        return this;
    }

    timestamp(timestamp: Date): this {
        this._timestamp = timestamp;
        return this;
    }

    payload(payload: Record<string, unknown>): this {
        this._payload = payload;
        return this;
    }

    traceId(traceId: string): this {
        this._traceId = traceId;
        return this;
    }

    build(): Log {
        return new Log(
            this._service,
            this._level,
            this._message,
            this._timestamp,
            this._payload,
            this._traceId,
        );
    }
}