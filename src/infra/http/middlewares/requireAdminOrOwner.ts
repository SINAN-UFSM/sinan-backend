import type { Request, Response, NextFunction } from 'express';

import { verifyBearerToken } from '#infra/http/helpers/verifyBearerToken';

export const requireAdminOrOwner = (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = verifyBearerToken(req);
        const targetUserId = req.params.id;

        if (decoded.role !== 'admin' && decoded.sub !== targetUserId) {
            return res.status(403).json({
                error: 'Access denied: You can only modify your own account'
            });
        }

        req.user = {
            id: decoded.sub,
            role: decoded.role as "admin" | "user"
        };

        next();
    } catch (error: unknown) {
        next(error);
    }
};