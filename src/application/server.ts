import * as fs from 'node:fs';

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as YAML from 'yaml';

const app = express();
app.use(express.json());

const file  = fs.readFileSync(require.resolve('../../docs/log.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 4010;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/docs`);
});