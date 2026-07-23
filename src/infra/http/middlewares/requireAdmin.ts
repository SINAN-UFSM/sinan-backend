import type { Request, Response, NextFunction } from 'express';

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Access denied: Admins only' });
        return;
    }
    next();
};

const requireAdminOrOwner = (req: Request, res: Response, next: NextFunction) => {
    const targetUserId = req.params.id;

    if (req.user?.role !== 'admin' && req.user?.id !== targetUserId) {
        res.status(403).json({
            error: 'Access denied: You can only modify your own account'
        });
        return;
    }
    next();
};

export { requireAdmin, requireAdminOrOwner };