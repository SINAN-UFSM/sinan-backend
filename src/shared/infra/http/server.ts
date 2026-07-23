import express from 'express';
import helmet from 'helmet';

import { router } from '#shared/infra/http/routes';
import { errorHandler } from '#shared/errors/errorHandler';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(router);
app.use(errorHandler);

export { app };