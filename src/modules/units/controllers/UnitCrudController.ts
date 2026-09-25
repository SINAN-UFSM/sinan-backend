import type { Request, Response, NextFunction } from 'express';
import type {
    UnitCrudServicePort,
    CreateUnitDTO,
    UpdateUnitDTO,
    ReadUnitsQueryDTO
} from '#modules/units/ports/UnitCrudServicePort';
import {
    createUnitSchema,
    updateUnitSchema,
    readUnitsQuerySchema,
    uuidParamSchema
} from '#modules/units/ports/UnitCrudServicePort';

export class UnitCrudController {
    private readonly unitService: UnitCrudServicePort;

    constructor(unitService: UnitCrudServicePort) {
        this.unitService = unitService;
    }

    async createUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const unitDTO: CreateUnitDTO = createUnitSchema.parse(req.body);
            const unit = await this.unitService.createUnit(unitDTO);

            res.status(201).json(unit);
        } catch (error: unknown) {
            next(error);
        }
    }

    async updateUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: publicId } = uuidParamSchema.parse(req.params);
            const bodyData = updateUnitSchema.parse(req.body);
            const unitDTO: UpdateUnitDTO = {
                publicId,
                ...bodyData,
            };

            await this.unitService.updateUnit(unitDTO);
            res.status(200).json({ message: 'Unit updated successfully' });
        } catch (error: unknown) {
            next(error);
        }
    }

    async deleteUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: publicId } = uuidParamSchema.parse(req.params);
            await this.unitService.deleteUnit(publicId);

            res.status(204).send();
        } catch (error: unknown) {
            next(error);
        }
    }

    async getUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: publicId } = uuidParamSchema.parse(req.params);
            const unit = await this.unitService.readUnit(publicId);

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
            const queryDTO: ReadUnitsQueryDTO = readUnitsQuerySchema.parse(req.query);

            const units = await this.unitService.readUnits(queryDTO);

            res.status(200).json(units);
        } catch (error: unknown) {
            next(error);
        }
    }
}