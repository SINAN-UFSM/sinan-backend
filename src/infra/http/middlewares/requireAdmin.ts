import type { Request, Response, NextFunction } from 'express';
import { verifyBearerToken } from '#infra/http/helpers/verifyBearerToken';

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = verifyBearerToken(req);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        req.user = {
            id: decoded.sub,
            role: decoded.role
        };

        next();
    } catch (error: unknown) {
        next(error);
    }
};

export { requireAdmin };