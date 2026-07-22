import type { UserCrudServicePort, CreateUserDTO } from '#modules/users/ports/UserCrudServicePort';

import type { Request, Response } from 'express';

class UserCrudController {
    private readonly service: UserCrudServicePort;

    constructor(service: UserCrudServicePort) {
        this.service = service;
    }

    public async createUser(req: Request, res: Response, next: (error: any) => void): Promise<void> {
        try {
            const missingFields: string[] = [];
            if (!req.body.name) missingFields.push('name');
            if (!req.body.email) missingFields.push('email');
            if (!req.body.password) missingFields.push('password');
            if (!req.body.role) missingFields.push('role');
            if (!req.body.unit_id) missingFields.push('unitId');

            if (missingFields.length > 0) {
                res.status(400).json({
                    error: `Missing required fields: ${missingFields.join(', ')}`
                });
                return;
            }

            const userDTO: CreateUserDTO = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role,
                unitId: req.body.unit_id
            };
            const user = await this.service.createUser(
                userDTO
            );

            res.status(201).json(user);
            return;
        } catch (error: any) {
            next(error);
        }
    }


    public async updateUser(req: Request, res: Response, next: (error: any) => void): Promise<void> {
        try {
            const userId = req.params.id as string;

            const isAdmin = req.user?.role === 'admin';
            const userDTO = {
                email: req.body.email,
                password: req.body.password,
                // Only allow role, name and unitId updates if the requester is an admin
                name: isAdmin ? req.body.name : undefined,
                role: isAdmin ? req.body.role : undefined,
                unitId: isAdmin ? req.body.unit_id : undefined
            };
            const updatedUser = await this.service.updateUser(userId, userDTO);

            res.status(200).json(updatedUser);
            return;
        } catch (error: any) {
            next(error);
        }
    }

    public async deleteUser(req: Request, res: Response, next: (error: any) => void): Promise<void> {
        try {
            const userId = req.params.id as string;
            await this.service.deleteUser(userId);

            res.status(204).send();
            return;
        } catch (error: any) {
            next(error);
        }
    }
}

export { UserCrudController };