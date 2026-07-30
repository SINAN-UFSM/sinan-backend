import type { Request, Response, NextFunction } from 'express';
import type {
    NotificationCrudServicePort,
    NotificationResponseDTO,
    UpdateNotificationRequestDTO,
    CreateNotificationRequestDTO,
    ReadNotificationsQueryDTO
} from '#modules/notifications/ports/NotificationCrudServicePort';
import {
    createNotificationSchema,
    readNotificationsQuerySchema,
    updateNotificationSchema,
    uuidParamSchema
} from '#modules/notifications/ports/NotificationCrudServicePort';

export class NotificationCrudController {
    private notificationService: NotificationCrudServicePort;

    constructor(notificationService: NotificationCrudServicePort) {
        this.notificationService = notificationService;
    }

    async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const notificationDTO: CreateNotificationRequestDTO = createNotificationSchema.parse(req.body);
            const notification: NotificationResponseDTO = await this.notificationService.createNotification(notificationDTO);

            res.status(201).json(notification);

        } catch (error: unknown) {
            next(error);
        }
    }

    async updateNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = uuidParamSchema.parse(req.params);

            const parsedBody = updateNotificationSchema.parse(req.body);
            const notificationDTO: UpdateNotificationRequestDTO = { id, ...parsedBody };

            const updatedNotification: NotificationResponseDTO = await this.notificationService.updateNotification(notificationDTO);
            res.status(200).json(updatedNotification);

        } catch (error: unknown) {
            next(error);
        }
    }

    async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = uuidParamSchema.parse(req.params);
            await this.notificationService.deleteNotification(id);

            res.status(204).send();
        } catch (error: unknown) {
            next(error);
        }
    }

    async getNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = uuidParamSchema.parse(req.params);
            const notification: NotificationResponseDTO = await this.notificationService.readNotification(id);

            if (!notification) {
                res.status(404).json({ error: 'Notification not found' });
                return;
            }

            res.status(200).json(notification);
        } catch (error: unknown) {
            next(error);
        }
    }

    async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const queryDTO: ReadNotificationsQueryDTO = readNotificationsQuerySchema.parse(req.query);

            const notifications = await this.notificationService.readNotifications(queryDTO);

            res.status(200).json(notifications);
        } catch (error: unknown) {
            next(error);
        }
    }
}