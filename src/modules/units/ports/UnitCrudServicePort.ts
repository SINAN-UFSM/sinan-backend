import { z } from 'zod';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';

export { idParamSchema } from '#shared/validators/common.validator';

const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export const createUnitSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty'),
    state: z.enum(validStates, { message: 'Invalid state' }),
    city: z.string().min(1, 'City cannot be empty'),
});

export const updateUnitSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    state: z.enum(validStates, { message: 'Invalid state' }).optional(),
    city: z.string().min(1, 'City cannot be empty').optional(),
});

export const readUnitsQuerySchema = z.object({
    name: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    search: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
});

type CreateUnitDTO = z.infer<typeof createUnitSchema>;

type UpdateUnitDTO = {
    id: number;
} & z.infer<typeof updateUnitSchema>;

type UnitResponseDTO = {
    id: number;
    name: string;
    state: string;
    city: string;
    isActive: boolean;
};

type ReadUnitsQueryDTO = z.infer<typeof readUnitsQuerySchema>;

interface UnitCrudServicePort {
    createUnit(unitDTO: CreateUnitDTO): Promise<UnitResponseDTO>;
    updateUnit(unitDTO: UpdateUnitDTO): Promise<UnitResponseDTO>;
    deleteUnit(id: number): Promise<void>;
    readUnit(id: number): Promise<UnitResponseDTO | null>;
    readUnits(queryDTO: ReadUnitsQueryDTO): Promise<PaginatedResponseDTO<UnitResponseDTO>>;
}

export type {
    CreateUnitDTO,
    UpdateUnitDTO,
    UnitResponseDTO,
    ReadUnitsQueryDTO,
    UnitCrudServicePort
};