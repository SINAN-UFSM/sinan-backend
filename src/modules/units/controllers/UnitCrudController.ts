import type { Request, Response, NextFunction } from 'express';
import type { CreateUnitDTO, UpdateUnitDTO, UnitCrudServicePort, ReadUnitsQueryDTO } from '#modules/units/ports/UnitCrudServicePort';

export class UnitCrudController {
    private readonly unitService: UnitCrudServicePort;

    constructor(unitService: UnitCrudServicePort) {
        this.unitService = unitService;
    }

    async createUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.body.name) {
                res.status(400).json({
                    error: `Missing required field: name`
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
            const rawId = req.params.id;
            const idString = Array.isArray(rawId) ? rawId[0] : rawId;
            const unitId = parseInt(idString, 10);

            if (isNaN(unitId)) {
                res.status(400).json({ error: 'Invalid unit ID' });
                return;
            }
            const unitDTO: UpdateUnitDTO = {
                id: unitId,
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
            const rawId = req.params.id;
            const idString = Array.isArray(rawId) ? rawId[0] : rawId;
            const unitId = parseInt(idString, 10);

            if (isNaN(unitId)) {
                res.status(400).json({ error: 'Invalid unit ID' });
                return;
            }

            await this.unitService.deleteUnit(unitId);
            res.status(204).send();
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    async getUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rawId = req.params.id;
            const idString = Array.isArray(rawId) ? rawId[0] : rawId;
            const unitId = parseInt(idString, 10);

            if (isNaN(unitId)) {
                res.status(400).json({ error: 'Invalid unit ID' });
                return;
            }

            const unit = await this.unitService.readUnit(unitId);
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
