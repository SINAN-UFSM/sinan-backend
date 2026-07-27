import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
    BadRequestError,
    UnauthorizedError,
    NotFoundError,
    ForbiddenError,
} from '#shared/errors/HttpErrors';

const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    if (err instanceof z.ZodError) {
        return res.status(400).json({
            error: 'Validation error',
            details: err.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }

    if (err instanceof BadRequestError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof UnauthorizedError) {
        return res.status(401).json({ error: err.message });
    }
    if (err instanceof ForbiddenError) {
        return res.status(403).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }

    console.error('[Unhandled Error]:', err);
    return res.status(500).json({ error: 'Internal server error' });
};

export { errorHandler };