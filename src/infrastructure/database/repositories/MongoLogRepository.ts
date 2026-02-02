import type { LogFilters } from '../../../application/ports/driven/LogFilters.js';
import type { LogRepository } from '../../../application/ports/driven/LogRepository.js';
import type { Log } from '../../../domain/Log.js';
import { DatabaseError } from '../../../errors/DatabaseError.js';
import { LogMapper } from '../mappers/LogMapper.js';
import type { LogDocument } from '../models/LogDocument.js';
import { MongooseLogModel } from '../models/LogModel.js';

export class MongoLogRepository implements LogRepository {
    
    async save(log: Log): Promise<void> {
        try {
            const persistenceData = LogMapper.toPersistence(log);
            await MongooseLogModel.create(persistenceData);

        } catch (error) {
            throw new DatabaseError('Failed to save log to MongoDB', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    async findAll(filters: LogFilters, limit: number, offset: number): Promise<{ items: Log[]; total: number }> {
        try {
            // Utilisation d'un type générique pour la query Mongoose pour éviter les soucis d'import de types instables
            const query: Record<string, unknown> = {};

            if (filters.service) {
                query.service = filters.service;
            }
            if (filters.level) {
                query.level = filters.level;
            }
            if (filters.traceId) {
                query.traceId = filters.traceId;
            }
            if (filters.userId) {
                query['payload.userId'] = filters.userId;
            }

            const [docs, total] = await Promise.all([
                MongooseLogModel.find(query)
                    .sort({ timestamp: -1 })
                    .skip(offset)
                    .limit(limit)
                    .lean(),
                MongooseLogModel.countDocuments(query)
            ]);

            // Casting explicite pour éviter les conflits de types Mongoose/TS
            const typedDocs = docs as unknown as LogDocument[];

            return {
                items: typedDocs.map((doc) => LogMapper.toDomain(doc)),
                total
            };

        } catch (error) {
            throw new DatabaseError('Failed to fetch logs from MongoDB', error instanceof Error ? error.message : 'Unknown error');
        }
    }
}
