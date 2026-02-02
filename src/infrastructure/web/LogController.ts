import type { NextFunction,Request, Response } from 'express';

import type { UseCase } from '../../application/ports/driving/UseCase.js';
import type { GetLogsQuery, GetLogsResponse } from '../../application/use-cases/GetLogsUseCase.js';

export class LogController {
    constructor(private readonly getLogsUseCase: UseCase<GetLogsQuery, GetLogsResponse>) {}

    getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = Number.parseInt(req.query.limit as string) || 50;
            const offset = Number.parseInt(req.query.offset as string) || 0;
            
            const serviceSource = req.query.serviceSource as string | undefined;
            const level = req.query.level as string | undefined;
            const userId = req.query.userId as string | undefined;
            const traceId = req.query.traceId as string | undefined;

            const result = await this.getLogsUseCase.execute({
                limit,
                offset,
                serviceSource,
                level,
                userId,
                traceId
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
