import type { Request, Response, NextFunction } from 'express';
import type { UserCrudServicePort, CreateUserDTO, UpdateUserDTO } from '#modules/users/ports/UserCrudServicePort';
import {
    createUserSchema,
    updateUserSchema,
    uuidParamSchema
} from '#modules/users/ports/UserCrudServicePort';

class UserCrudController {
    private readonly service: UserCrudServicePort;

    constructor(service: UserCrudServicePort) {
        this.service = service;
    }

    public async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userDTO: CreateUserDTO = createUserSchema.parse(req.body);

            const user = await this.service.createUser(userDTO);

            res.status(201).json(user);
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = uuidParamSchema.parse(req.params);

            const parsedBody = updateUserSchema.parse(req.body);

            const isAdmin = req.user?.role === 'admin';
            const userDTO: UpdateUserDTO = {
                id,
                email: parsedBody.email,
                password: parsedBody.password,
                name: isAdmin ? parsedBody.name : undefined,
                role: isAdmin ? parsedBody.role : undefined,
                unitId: isAdmin ? parsedBody.unitId : undefined
            };

            const updatedUser = await this.service.updateUser(userDTO);

            res.status(200).json(updatedUser);
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = uuidParamSchema.parse(req.params);

            await this.service.deleteUser(id);

            res.status(204).send();
            return;
        } catch (error: unknown) {
            next(error);
        }
    }
}

export { UserCrudController };