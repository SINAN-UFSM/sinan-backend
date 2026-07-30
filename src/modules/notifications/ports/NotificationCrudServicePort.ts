import { z } from 'zod';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';
import { uuidParamSchema } from '#shared/validators/common.validator';
import { createNotificationsBotulismPayloadSchema } from '#shared/infra/database/drizzle/diseases/notifications_botulism';

// Importe aqui os schemas de payloads de novas doenças à medida que forem geradas:
// import { createNotificationsDenguePayloadSchema } from '#shared/infra/database/drizzle/diseases/notifications_dengue';

export { uuidParamSchema };

const specificFieldsSchemas: Record<string, z.ZodSchema> = {
    botulism: createNotificationsBotulismPayloadSchema,
};

const baseNotificationFields = {
    patientId: z.uuid('Patient ID must be a valid UUID'),
    dtNotification: z.string().min(1, 'Notification date cannot be empty'),
    occurrenceDate: z.string().min(1, 'Occurrence date cannot be empty'),
    unitId: z.coerce.number().int().positive('Health unit ID must be positive').optional(),
    notes: z.string().optional(),
    status: z.string().default('ACTIVE').optional(),
};

const baseUpdateNotificationFields = {
    dtNotification: z.string().min(1, 'Notification date cannot be empty').optional(),
    occurrenceDate: z.string().min(1, 'Occurrence date cannot be empty').optional(),
    unitId: z.coerce.number().int().positive('Health unit ID must be positive').optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
};

const baseCreateSchema = z.object({
    notificationTypeSlug: z.string(),
    ...baseNotificationFields,
    specificFields: z.unknown(),
});

const baseUpdateSchema = z.object({
    notificationTypeSlug: z.string(),
    ...baseUpdateNotificationFields,
    specificFields: z.unknown().optional(),
});

export const createNotificationSchema = baseCreateSchema.transform((data, ctx) => {
    const specificSchema = specificFieldsSchemas[data.notificationTypeSlug];

    if (!specificSchema) {
        ctx.addIssue({
            code: "custom",
            message: "Notification type is invalid or not supported",
            path: ["notificationTypeSlug"]
        });
        return z.NEVER;
    }

    const result = specificSchema.safeParse(data.specificFields);

    if (!result.success) {
        result.error.issues.forEach((issue) => {
            ctx.addIssue({
                ...issue,
                path: ["specificFields", ...issue.path]
            });
        });
        return z.NEVER;
    }

    return {
        ...data,
        specificFields: result.data as unknown,
    };
});

export const updateNotificationSchema = baseUpdateSchema.transform((data, ctx) => {
    if (!(data.notificationTypeSlug in specificFieldsSchemas)) {
        ctx.addIssue({
            code: "custom",
            message: "Notification type is invalid or not supported",
            path: ["notificationTypeSlug"]
        });
        return z.NEVER;
    }

    if (data.specificFields === undefined) {
        return data;
    }

    const slug = data.notificationTypeSlug as keyof typeof specificFieldsSchemas;
    const specificSchema = specificFieldsSchemas[slug];

    const updateSpecificSchema = (specificSchema as z.ZodObject<Record<string, z.ZodType>>).partial();

    const result = updateSpecificSchema.safeParse(data.specificFields);

    if (!result.success) {
        result.error.issues.forEach((issue) => {
            ctx.addIssue({
                ...issue,
                path: ["specificFields", ...(issue.path || [])]
            });
        });
        return z.NEVER;
    }

    return {
        ...data,
        specificFields: result.data as unknown,
    };
});

export const readNotificationsQuerySchema = z.object({
    patientId: z.uuid().optional(),
    notificationTypeSlug: z.string().optional(),
    page: z.coerce.number()
        .int('Page must be an integer')
        .min(1)
        .default(1),
    limit: z.coerce.number()
        .int('Limit must be an integer')
        .min(1)
        .max(100, 'Limit cannot exceed 100 items per page')
        .default(10),
});

type CreateNotificationRequestDTO = z.infer<typeof createNotificationSchema>;

type UpdateNotificationRequestDTO = {
    id: string;
} & z.infer<typeof updateNotificationSchema>;

type NotificationFiltersDTO = z.infer<typeof readNotificationsQuerySchema>;
type ReadNotificationsQueryDTO = NotificationFiltersDTO;

type NotificationResponseDTO = {
    id: string;
    patientId: string;
    notificationTypeSlug: string;
    dtNotification: string;
    occurrenceDate: string;
    status: string;
    notes?: string;
    unitId?: number;

    patientName?: string;
    patientCpf?: string;

    createdAt?: Date;
    updatedAt?: Date;
    specificFields: Record<string, unknown>;
};

interface NotificationCrudServicePort {
    createNotification(notificationDTO: CreateNotificationRequestDTO): Promise<NotificationResponseDTO>;
    updateNotification(notificationDTO: UpdateNotificationRequestDTO): Promise<NotificationResponseDTO>;
    deleteNotification(id: string): Promise<void>;
    readNotification(id: string): Promise<NotificationResponseDTO>;
    readNotifications(filters: ReadNotificationsQueryDTO): Promise<PaginatedResponseDTO<NotificationResponseDTO>>;
}

export type {
    CreateNotificationRequestDTO,
    UpdateNotificationRequestDTO,
    NotificationResponseDTO,
    ReadNotificationsQueryDTO,
    NotificationFiltersDTO,
    NotificationCrudServicePort
};