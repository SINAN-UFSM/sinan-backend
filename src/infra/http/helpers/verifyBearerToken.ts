import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import { InternalServerError, UnauthorizedError } from '#errors/HttpErrors';

const verifyBearerToken = (req: Request): { sub: string; role: string } => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        throw new InternalServerError('JWT_SECRET is not defined');
    }

    try {
        return jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
    } catch {
        throw new UnauthorizedError('Invalid or expired token');
    }
};

export { verifyBearerToken };