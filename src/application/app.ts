import fs from 'node:fs';
import { resolve } from 'node:path';

import type { Application } from 'express';
import express from 'express';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

import { logger } from '../infrastructure/logging/logger.js';
import { errorHandler } from '../infrastructure/web/middlewares/ErrorHandler.js';

const app: Application = express();

app.use(pinoHttp({ logger }));

app.use(express.json());

try {
    const file = fs.readFileSync(resolve(process.cwd(), 'docs/log.yaml'), 'utf8');
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(parse(file)));
} catch (error) {
    logger.error({ error }, 'Failed to load Swagger documentation');
}

export { app, errorHandler };