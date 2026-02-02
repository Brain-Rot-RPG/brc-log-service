import type { Log } from '../../../domain/Log.js';

export interface LogRepository {
    save(log: Log): Promise<void>;
    findRecent(limit: number, offset: number): Promise<{ items: Log[]; total: number }>;
}
