import type { UnitCrudServicePort, UnitResponseDTO, UpdateUnitDTO, CreateUnitDTO, ReadUnitsQueryDTO } from "#modules/units/ports/UnitCrudServicePort";
import { Unit } from "#modules/units/entities/Unit";

import type { UnitRepositoryPort } from "#modules/units/ports/UnitRepositoryPort";
import { NotFoundError } from "#shared/errors/HttpErrors";
import { State } from "#modules/units/value-objects/State";
import type { PaginatedResponseDTO } from "#shared/dtos/paginated-query.dto";

class UnitCrudService implements UnitCrudServicePort {
    private readonly unitRepository: UnitRepositoryPort;

    constructor(unitRepository: UnitRepositoryPort) {
        this.unitRepository = unitRepository;
    }

    async createUnit(unitDTO: CreateUnitDTO): Promise<UnitResponseDTO> {
        const state = State.create(unitDTO.state);
        const unit = Unit.create({
            name: unitDTO.name,
            state: state,
            city: unitDTO.city,
        });
        const dbUnit = await this.unitRepository.save(unit);
        const unitResponse: UnitResponseDTO = {
            id: dbUnit.id as number,
            name: dbUnit.name,
            state: dbUnit.state.value,
            city: dbUnit.city,
            isActive: dbUnit.isActive,
        }

        return unitResponse;
    }

    async updateUnit(unitDTO: UpdateUnitDTO): Promise<UnitResponseDTO> {
        const existingUnit = await this.unitRepository.findById(unitDTO.id);
        if (!existingUnit) {
            throw new NotFoundError(`Unit with ID ${unitDTO.id} not found`);
        }
        const unitName = unitDTO.name ?? existingUnit.name;
        const state = unitDTO.state !== undefined ? State.create(unitDTO.state) : existingUnit.state;
        const unit = Unit.create({
            id: unitDTO.id,
            name: unitName,
            state: state,
            city: unitDTO.city ?? existingUnit.city,
        });

        const dbUnit = await this.unitRepository.update(unitDTO.id, unit);
        const unitResponse: UnitResponseDTO = {
            id: dbUnit.id as number,
            name: dbUnit.name,
            state: dbUnit.state.value,
            city: dbUnit.city,
            isActive: dbUnit.isActive,
        }

        return unitResponse;
    }

    async deleteUnit(unitId: number): Promise<void> {
        const existingUnit = await this.unitRepository.findById(unitId);
        if (!existingUnit) {
            throw new NotFoundError(`Unit with ID ${unitId} not found`);
        }

        await this.unitRepository.delete(unitId);
    }

    async readUnit(unitId: number): Promise<UnitResponseDTO | null> {
        const dbUnit = await this.unitRepository.findById(unitId);
        if (!dbUnit) {
            return null;
        }

        const unitResponse: UnitResponseDTO = {
            id: dbUnit.id as number,
            name: dbUnit.name,
            state: dbUnit.state.value,
            city: dbUnit.city,
            isActive: dbUnit.isActive,
        }

        return unitResponse;
    }

    async readUnits(queryDTO: ReadUnitsQueryDTO): Promise<PaginatedResponseDTO<UnitResponseDTO>> {
        const paginatedUnits = await this.unitRepository.findPaginated(queryDTO);

        const unitResponseDTOs: UnitResponseDTO[] = paginatedUnits.data.map((unit) => ({
            id: unit.id as number,
            name: unit.name,
            state: unit.state.value,
            city: unit.city,
            isActive: unit.isActive,
        }));

        return {
            data: unitResponseDTOs,
            page: paginatedUnits.page,
            limit: paginatedUnits.limit,
            total: paginatedUnits.total,
            totalPages: paginatedUnits.totalPages,
        };
    }
}

export { UnitCrudService };