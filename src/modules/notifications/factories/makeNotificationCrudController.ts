import { NotificationCrudController } from '#modules/notifications/controllers/NotificationCrudController';
import { NotificationCrudService } from '#modules/notifications/services/NotificationCrudService';
import { DrizzleNotificationRepository } from '#modules/notifications/repositories/DrizzleNotificationRepository';
import { DrizzlePatientRepository } from '#modules/patients/repositories/DrizzlePatientRepository';

export const makeNotificationCrudController = (): NotificationCrudController => {
    const notificationRepository = new DrizzleNotificationRepository();
    const patientRepository = new DrizzlePatientRepository();

    const notificationCrudService = new NotificationCrudService(
        notificationRepository,
        patientRepository,
    );

    const notificationCrudController = new NotificationCrudController(notificationCrudService);

    return notificationCrudController;
};