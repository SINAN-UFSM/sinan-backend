import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import type { UserRepositoryPort } from '#modules/users/ports/UserRepositoryPort';
import type { UserAuthServicePort, LoginRequestDTO, LoginResponseDTO } from '#modules/users/ports/UserAuthServicePort';
import type { RefreshTokenRepositoryPort } from '#modules/users/ports/RefreshTokenRepositoryPort';

import { RefreshToken } from '../entities/RefreshToken.js';

import { Email } from '#modules/users/value-objects/Email';
import { UnauthorizedError } from '#shared/errors/HttpErrors';

class UserAuthService implements UserAuthServicePort {
    private userRepository: UserRepositoryPort;
    private refreshTokenRepository: RefreshTokenRepositoryPort;
    private readonly JWT_SECRET = process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET is not defined'); })();

    constructor(userRepository: UserRepositoryPort, refreshTokenRepository: RefreshTokenRepositoryPort) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public async login(request: LoginRequestDTO): Promise<LoginResponseDTO> {
        const { email, password } = request;
        const emailVO = Email.create(email);
        const user = await this.userRepository.findByEmail(emailVO.value);

        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isPasswordValid = await user.hashedPassword.compare(password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const payload = {
            sub: user.id,
            role: user.role
        }

        const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '15m' }); // JWT Token
        const refreshToken = crypto.randomBytes(40).toString('hex'); // Opaque Token

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        const domainRefreshToken = RefreshToken.create(user.id as string, tokenHash, expiresAt);
        await this.refreshTokenRepository.save(domainRefreshToken);

        return {
            token,
            refreshToken,
        };
    }

    public async logout(refreshToken: string): Promise<void> {
        if (!refreshToken) return;
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await this.refreshTokenRepository.delete(tokenHash);
    }

    public async refresh(oldRefreshToken: string): Promise<LoginResponseDTO> {
        const tokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
        const deletedToken = await this.refreshTokenRepository.consumeByHash(tokenHash);

        if (!deletedToken || deletedToken.isExpired()) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        const user = await this.userRepository.findById(deletedToken.UserId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        const payload = {
            sub: user.id,
            role: user.role
        }

        const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '15m' }); // JWT Token
        const newRefreshToken = crypto.randomBytes(40).toString('hex'); // Opaque Token

        const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        const domainRefreshToken = RefreshToken.create(user.id as string, newTokenHash, expiresAt);
        await this.refreshTokenRepository.save(domainRefreshToken);

        // Revoke the old refresh token
        await this.refreshTokenRepository.delete(tokenHash);

        return {
            token,
            refreshToken: newRefreshToken,
        };
    }
}

export { UserAuthService };