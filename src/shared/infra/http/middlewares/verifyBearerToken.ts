import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { InternalServerError, UnauthorizedError } from '#shared/errors/HttpErrors';

const verifyBearerToken = (req: Request, _: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token is missing or malformed');
        }

        const token = authHeader.split(' ')[1];
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new InternalServerError('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };

        req.user = {
            id: decoded.sub,
            role: decoded.role as "admin" | "user"
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid or expired token'));
        } else {
            next(error);
        }
    }
};

export { verifyBearerToken };