import type { Log } from '../../domain/Log.js';
import type { LogRepository } from '../ports/driven/LogRepository.js';
import type { UseCase } from '../ports/driving/UseCase.js';

export class CreateLogUseCase implements UseCase<Log, void> {
    constructor(private readonly logRepository: LogRepository) {}

    async execute(log: Log): Promise<void> {
        await this.logRepository.save(log);
    }
}
