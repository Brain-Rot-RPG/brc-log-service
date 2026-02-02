import type { Log } from '../../../domain/Log.js';
import type { LogFilters } from './LogFilters.js';

export interface LogRepository {
    save(log: Log): Promise<void>;
    findAll(filters: LogFilters, limit: number, offset: number): Promise<{ items: Log[]; total: number }>;
}
