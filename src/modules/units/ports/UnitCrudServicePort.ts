import type { PaginatedQueryDTO, PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';

type CreateUnitDTO = {
    name: string;
    state: string;
    city: string;
}

type UpdateUnitDTO = {
    id: number;
    name?: string;
    state?: string;
    city?: string;
}

type UnitResponseDTO = {
    id: number;
    name: string;
    state: string;
    city: string;
    isActive: boolean;
};

type UnitFiltersDTO = {
    name?: string;
    state?: string;
    city?: string;
    isActive?: boolean;
};

type ReadUnitsQueryDTO = PaginatedQueryDTO<UnitFiltersDTO>;

interface UnitCrudServicePort {
    createUnit(unitDTO: CreateUnitDTO): Promise<UnitResponseDTO>;
    updateUnit(unitDTO: UpdateUnitDTO): Promise<UnitResponseDTO>;
    deleteUnit(id: number): Promise<void>;
    readUnit(id: number): Promise<UnitResponseDTO | null>;
    readUnits(queryDTO: ReadUnitsQueryDTO): Promise<PaginatedResponseDTO<UnitResponseDTO>>;
}

export type { CreateUnitDTO, UpdateUnitDTO, UnitResponseDTO, ReadUnitsQueryDTO, UnitFiltersDTO, UnitCrudServicePort };