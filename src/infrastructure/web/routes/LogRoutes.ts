import { Router } from 'express';

import type { LogController } from '../LogController.js';

export const createLogRouter = (controller: LogController): Router => {
    const router = Router();
    
    router.get('/', controller.getLogs);
    
    return router;
};
