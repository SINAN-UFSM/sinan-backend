import type { Request, Response, NextFunction } from 'express';
import type { CreateUnitDTO, UpdateUnitDTO, UnitCrudServicePort, ReadUnitsQueryDTO } from '#modules/units/ports/UnitCrudServicePort';

export class UnitCrudController {
    private readonly unitService: UnitCrudServicePort;

    constructor(unitService: UnitCrudServicePort) {
        this.unitService = unitService;
    }

    async createUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const unitDTO: CreateUnitDTO = req.body;
            const unit = await this.unitService.createUnit(unitDTO);

            res.status(201).json(unit);
        } catch (error: unknown) {
            next(error);
        }
    }

    async updateUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as { id: number };
            const unitDTO: UpdateUnitDTO = {
                id,
                ...req.body,
            };

            await this.unitService.updateUnit(unitDTO);
            res.status(200).json({ message: 'Unit updated successfully' });
        } catch (error: unknown) {
            next(error);
        }
    }

    async deleteUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as { id: number };
            await this.unitService.deleteUnit(id);

            res.status(204).send();
        } catch (error: unknown) {
            next(error);
        }
    }

    async getUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as { id: number };
            const unit = await this.unitService.readUnit(id);

            if (!unit) {
                res.status(404).json({ error: 'Unit not found' });
                return;
            }

            res.status(200).json(unit);
        } catch (error: unknown) {
            next(error);
        }
    }

    async getUnits(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const queryDTO: ReadUnitsQueryDTO = req.query as unknown as ReadUnitsQueryDTO;
            const units = await this.unitService.readUnits(queryDTO);

            res.status(200).json(units);
        } catch (error: unknown) {
            next(error);
        }
    }
}