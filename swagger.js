import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const swaggerFilePath = path.resolve('./docs/swagger.yaml');
const swaggerDocument = yaml.load(fs.readFileSync(swaggerFilePath, 'utf8'));

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
