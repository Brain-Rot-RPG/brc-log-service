import type { Log } from '../../domain/Log.js';
import type { LogLevel } from '../../domain/LogLevel.js';
import type { LogFilters } from '../ports/driven/LogFilters.js';
import type { LogRepository } from '../ports/driven/LogRepository.js';
import type { UseCase } from '../ports/driving/UseCase.js';

export interface GetLogsQuery {
    limit: number;
    offset: number;
    serviceSource?: string;
    level?: string;
    userId?: string;
    traceId?: string;
}

export type GetLogsResponse = { items: Log[]; total: number };

export class GetLogsUseCase implements UseCase<GetLogsQuery, GetLogsResponse> {
    constructor(private readonly repository: LogRepository) {}

    async execute(query: GetLogsQuery): Promise<GetLogsResponse> {
        // Validation et nettoyage des paramètres
        const limit = Math.min(Math.max(query.limit, 1), 100); // Max 100 items
        const offset = Math.max(query.offset, 0);

        const filters: LogFilters = {};

        if (query.serviceSource) {
            filters.service = query.serviceSource;
        }

        if (query.level) {
            filters.level = query.level as LogLevel;
        }

        if (query.traceId) {
            filters.traceId = query.traceId;
        }

        if (query.userId) {
            filters.userId = query.userId;
        }

        return this.repository.findAll(filters, limit, offset);
    }
}
