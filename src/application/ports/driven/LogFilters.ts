import type { LogLevel } from '../../../domain/LogLevel.js';

export interface LogFilters {
    service?: string;
    level?: LogLevel;
    traceId?: string;
    userId?: string;
}
