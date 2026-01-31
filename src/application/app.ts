import fs from 'node:fs';
import { resolve } from 'node:path';

import type { Application } from 'express';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

const app: Application = express();

app.use(express.json());

const file = fs.readFileSync(resolve(process.cwd(), 'docs/log.yaml'), 'utf8');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(parse(file)));

export { app };