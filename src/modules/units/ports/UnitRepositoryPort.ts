import { Unit } from '#modules/units/entities/Unit';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';
import type { ReadUnitsQueryDTO } from '#modules/units/ports/UnitCrudServicePort';

interface UnitRepositoryPort {
    save(unit: Unit): Promise<Unit>;
    update(publicId: string, unit: Unit): Promise<Unit>;
    delete(publicId: string): Promise<void>;
    findById(publicId: string): Promise<Unit | null>;
    findPaginated(query: ReadUnitsQueryDTO): Promise<PaginatedResponseDTO<Unit>>;
}

export type { UnitRepositoryPort };