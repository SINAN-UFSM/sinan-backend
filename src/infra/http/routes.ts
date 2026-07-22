import path from 'path';
import fs from 'fs';

import Express from 'express';
import type { Request, Response } from 'express';
import { Router } from 'express';

import swaggerUi from 'swagger-ui-express';
import SwaggerParser from '@apidevtools/swagger-parser';
import YAML from 'yamljs';

import { makeUserCrudController } from '#modules/users/factories/makeUserCrudController';
import { makeUserAuthController } from '#modules/users/factories/makeUserAuthController';

import { requireAdmin } from './middlewares/requireAdmin.js';
import { requireAdminOrOwner } from './middlewares/requireAdminOrOwner.js';

const router = Router();

const userController = makeUserCrudController();
router.post('/api/v1/users', requireAdmin, userController.createUser.bind(userController));
router.patch('/api/v1/users/:id', requireAdminOrOwner, userController.updateUser.bind(userController));
router.delete('/api/v1/users/:id', requireAdminOrOwner, userController.deleteUser.bind(userController));

const authController = makeUserAuthController();
router.post('/api/v1/auth/login', authController.login.bind(authController));
router.post('/api/v1/auth/logout', authController.logout.bind(authController));
router.post('/api/v1/auth/refresh', authController.refresh.bind(authController));

const swaggerPath = path.resolve(process.cwd(), 'docs', 'api', 'api.yaml');
const swaggerDocument = YAML.load(swaggerPath);
SwaggerParser.dereference(swaggerPath)
    .then((swaggerDocument) => {
        router.use('/api/docs', swaggerUi.serve);
        router.get('/api/docs', swaggerUi.setup(swaggerDocument));
    })
    .catch((err) => {
        console.error('Falha ao processar os arquivos do Swagger:', err);
    });

router.use('/api/v1/docs', swaggerUi.serve);
router.get('/api/v1/docs', swaggerUi.setup(swaggerDocument));

router.get('/health', (_: Request, res: Response) => {
    return res.status(200).json(
        {
            status: 'OK',
            message: 'API is running',
            timestamp: new Date()
        }
    );
});

router.use('/docs/assets', Express.static(path.resolve(process.cwd(), 'docs', 'assets')));
router.get('/api/v1/docs/architecture/architecture.md', (_: Request, res: Response) => {
    const mdPath = path.resolve(process.cwd(), 'docs', 'architecture', 'architecture.md');

    if (fs.existsSync(mdPath)) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.sendFile(mdPath);
    } else {
        res.status(404).send('# Arquivo de arquitetura não encontrado');
    }
});


router.get('/api/v1/docs/architecture', (_: Request, res: Response) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Documentação da Arquitetura</title>
      <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
    </head>
    <body>
      <div id="app">Carregando documentação...</div>
      <script>
        window.$docsify = {
          name: 'SINAN Backend',
          repo: '',
          loadSidebar: false,
          homepage: 'architecture.md',
        }
      </script>
      <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
    </body>
    </html>
  `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
});
export { router };