import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAdminOrOwner = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const JWT_SECRET = process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET is not defined'); })();
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string, role: string };
        const targetUserId = req.params.id;

        if (decoded.role !== 'admin' && decoded.sub !== targetUserId) {
            return res.status(403).json({
                error: 'Access denied: You can only modify your own account'
            });
        }

        req.user = {
            id: decoded.sub,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};