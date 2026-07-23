import type { Request, Response, NextFunction } from 'express';
import type { CreateUnitDTO, UpdateUnitDTO, UnitCrudServicePort, ReadUnitsQueryDTO } from '#modules/units/ports/UnitCrudServicePort';

export class UnitCrudController {
    private readonly unitService: UnitCrudServicePort;

    constructor(unitService: UnitCrudServicePort) {
        this.unitService = unitService;
    }

    async createUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, state, city } = req.body;
            if (!name || !state || !city) {
                res.status(400).json({
                    error: 'Missing required fields: name, state, and city are mandatory.'
                });
                return;
            }
            const unitDTO: CreateUnitDTO = {
                name: req.body.name,
                state: req.body.state,
                city: req.body.city,
            };
            const unit = await this.unitService.createUnit(unitDTO);

            res.status(201).json(unit);
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    async updateUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idParam = req.params.id;
            const id = Number(idParam);

            if (!Number.isSafeInteger(id) || id <= 0) {
                res.status(400).json({
                    error: 'Invalid ID: must be a positive integer.'
                });
                return;
            }
            const unitDTO: UpdateUnitDTO = {
                id: id,
                name: req.body.name,
                state: req.body.state,
                city: req.body.city,
            };

            await this.unitService.updateUnit(unitDTO);
            res.status(200).json({ message: 'Unit updated successfully' });
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    async deleteUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idParam = req.params.id;
            const id = Number(idParam);

            if (!Number.isSafeInteger(id) || id <= 0) {
                res.status(400).json({
                    error: 'Invalid ID: must be a positive integer.'
                });
                return;
            }

            await this.unitService.deleteUnit(id);
            res.status(204).send();
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    async getUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idParam = req.params.id;
            const id = Number(idParam);

            if (!Number.isSafeInteger(id) || id <= 0) {
                res.status(400).json({
                    error: 'Invalid ID: must be a positive integer.'
                });
                return;
            }

            const unit = await this.unitService.readUnit(id);
            if (!unit) {
                res.status(404).json({ error: 'Unit not found' });
                return;
            }

            res.status(200).json(unit);
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    async getUnits(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const queryDTO: ReadUnitsQueryDTO = {
                name: req.query.name as string | undefined,
                state: req.query.state as string | undefined,
                city: req.query.city as string | undefined,
                page: req.query.page ? Number(req.query.page) || undefined : undefined,
                limit: req.query.limit ? Number(req.query.limit) || undefined : undefined,
                search: req.query.search as string | undefined,
                isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
            };

            const units = await this.unitService.readUnits(queryDTO);
            res.status(200).json(units);
            return;
        } catch (error: unknown) {
            next(error);
        }
    }
}
