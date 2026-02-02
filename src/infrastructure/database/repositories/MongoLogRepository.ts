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

    async findRecent(limit: number, offset: number): Promise<{ items: Log[]; total: number }> {
        try {
            const [docs, total] = await Promise.all([
                MongooseLogModel.find({})
                    .sort({ timestamp: -1 })
                    .skip(offset)
                    .limit(limit)
                    .lean<LogDocument[]>(),
                MongooseLogModel.countDocuments({})
            ]);

            return {
                items: docs.map((doc) => LogMapper.toDomain(doc)),
                total
            };

        } catch (error) {
            throw new DatabaseError('Failed to fetch logs from MongoDB', error instanceof Error ? error.message : 'Unknown error');
        }
    }
}
