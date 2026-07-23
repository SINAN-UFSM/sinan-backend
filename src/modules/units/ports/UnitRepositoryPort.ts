import { Unit } from '#modules/units/entities/Unit';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';
import type { ReadUnitsQueryDTO } from '#modules/units/ports/UnitCrudServicePort';

interface UnitRepositoryPort {
    save(unit: Unit): Promise<Unit>;
    update(id: number, unit: Unit): Promise<Unit>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Unit | null>;
    findPaginated(query: ReadUnitsQueryDTO): Promise<PaginatedResponseDTO<Unit>>;
}

export type { UnitRepositoryPort };