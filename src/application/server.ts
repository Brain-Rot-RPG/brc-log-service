import * as fs from 'node:fs';

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as YAML from 'yaml';

import {logger} from '../infrastructure/logging/logger';

const app = express();
app.use(express.json());

const file  = fs.readFileSync(require.resolve('../../docs/log.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

if (process.env.NODE_ENV !== 'production') {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

const port = process.env.PORT || 4010;
app.listen(port, () => {
    logger.info(`Server listening on http://localhost:${port}`);
    if (process.env.NODE_ENV !== 'production') {
        logger.info(`Swagger docs at http://localhost:${port}/docs`);
    }
});