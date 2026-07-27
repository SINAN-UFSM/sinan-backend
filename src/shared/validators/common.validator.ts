import { z } from 'zod';

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive('ID must be a positive integer'),
});

export const uuidParamSchema = z.object({
    id: z.string().uuid('Invalid UUID format'),
});

export const paginationQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
});