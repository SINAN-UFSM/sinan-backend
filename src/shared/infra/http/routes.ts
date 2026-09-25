import path from 'path';

import Express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import swaggerUi from 'swagger-ui-express';
import SwaggerParser from '@apidevtools/swagger-parser';
import YAML from 'yamljs';

import { makeUserCrudController } from '#modules/users/factories/makeUserCrudController';
import { makeUserAuthController } from '#modules/users/factories/makeUserAuthController';
import { makeUnitCrudController } from '#modules/units/factories/makeUnitCrudController';
import { makePatientCrudController } from '#modules/patients/factories/makePatientCrudController';
import { makeNotificationCrudController } from '#modules/notifications/factories/makeNotificationCrudController';

import { verifyBearerToken } from '#shared/infra/http/middlewares/verifyBearerToken';

import { requireAdmin } from '#shared/infra/http/middlewares/requireAdmin';
import { requireAdminOrOwner } from '#shared/infra/http/middlewares/requireAdminOrOwner';

const router = Router();

const authController = makeUserAuthController();
router.post('/api/v1/auth/login', authController.login.bind(authController));
router.post('/api/v1/auth/logout', authController.logout.bind(authController));
router.post('/api/v1/auth/refresh', authController.refresh.bind(authController));

const userController = makeUserCrudController();
router.post('/api/v1/users', verifyBearerToken, requireAdmin, userController.createUser.bind(userController));
router.patch('/api/v1/users/:id', verifyBearerToken, requireAdminOrOwner, userController.updateUser.bind(userController));
router.delete('/api/v1/users/:id', verifyBearerToken, requireAdminOrOwner, userController.deleteUser.bind(userController));

const unitController = makeUnitCrudController();
router.get('/api/v1/units', verifyBearerToken, unitController.getUnits.bind(unitController));
router.post('/api/v1/units', verifyBearerToken, unitController.createUnit.bind(unitController));
router.get('/api/v1/units/:id', verifyBearerToken, unitController.getUnit.bind(unitController));
router.patch('/api/v1/units/:id', verifyBearerToken, unitController.updateUnit.bind(unitController));
router.delete('/api/v1/units/:id', verifyBearerToken, unitController.deleteUnit.bind(unitController));

const patientController = makePatientCrudController();
router.get('/api/v1/patients', verifyBearerToken, patientController.getPatients.bind(patientController));
router.post('/api/v1/patients', verifyBearerToken, patientController.createPatient.bind(patientController));
router.get('/api/v1/patients/:id', verifyBearerToken, patientController.getPatient.bind(patientController));
router.patch('/api/v1/patients/:id', verifyBearerToken, patientController.updatePatient.bind(patientController));
router.delete('/api/v1/patients/:id', verifyBearerToken, patientController.deletePatient.bind(patientController));

const notificationController = makeNotificationCrudController();
router.get('/api/v1/notifications', verifyBearerToken, notificationController.getNotifications.bind(notificationController));
router.post('/api/v1/notifications', verifyBearerToken, notificationController.createNotification.bind(notificationController));
router.get('/api/v1/notifications/:id', verifyBearerToken, notificationController.getNotification.bind(notificationController));
router.patch('/api/v1/notifications/:id', verifyBearerToken, notificationController.updateNotification.bind(notificationController));
router.delete('/api/v1/notifications/:id', verifyBearerToken, notificationController.deleteNotification.bind(notificationController));

router.get('/health', (_: Request, res: Response) => {
    return res.status(200).json(
        {
            status: 'OK',
            message: 'API is running',
            timestamp: new Date()
        }
    );
});

const swaggerPath = path.resolve(process.cwd(), 'docs', 'api', 'api.yaml');
const rawSwaggerDocument = YAML.load(swaggerPath);
let swaggerSetupMiddleware = swaggerUi.setup(rawSwaggerDocument);

SwaggerParser.dereference(swaggerPath)
    .then((dereferencedDocument) => {
        swaggerSetupMiddleware = swaggerUi.setup(dereferencedDocument);
    })
    .catch((err) => {
        console.error('Error trying to dereference Swagger document:', err);
    });

const docsPaths = ['/api/docs', '/api/v1/docs'];
router.use(docsPaths, swaggerUi.serve);
router.get(docsPaths, (req: Request, res: Response, next: NextFunction) => {
    swaggerSetupMiddleware(req, res, next);
});


router.use('/docs/assets', Express.static(path.resolve(process.cwd(), 'docs', 'assets')));

export { router };