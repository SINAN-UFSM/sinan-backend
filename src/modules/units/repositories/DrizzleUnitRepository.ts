import { eq, ilike, or, and, count } from 'drizzle-orm';
import { State } from '#modules/units/value-objects/State';

import { db } from '#infra/database/drizzle/connection';
import { Unit } from '#modules/units/entities/Unit';
import { unitsTable } from '#infra/database/drizzle/schema';
import type { DbUnit } from '#infra/database/drizzle/schema';

import type { ReadUnitsQueryDTO } from '../ports/UnitCrudServicePort.js';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';

class DrizzleUnitRepository {
    public async save(unit: Unit): Promise<Unit> {
        const rawData = {
            name: unit.name,
            city: unit.city,
            state: unit.state.value,
            isActive: unit.isActive,
        };

        const [dbUnit] = await db.insert(unitsTable)
            .values(rawData)
            .returning();


        return this.mapToDomain(dbUnit);
    }

    public async update(id: number, unit: Unit): Promise<Unit> {
        const updateData = {
            name: unit.name,
        };

        const [dbUnit] = await db.update(unitsTable)
            .set(updateData)
            .where(eq(unitsTable.id, id))
            .returning();

        return this.mapToDomain(dbUnit);
    }

    public async delete(id: number): Promise<void> {
        await db.update(unitsTable)
            .set({ isActive: false })
            .where(eq(unitsTable.id, id));
    }

    public async findById(id: number): Promise<Unit | null> {
        const dbUnit = await db.select()
            .from(unitsTable)
            .where(eq(unitsTable.id, id));

        if (dbUnit.length === 0) {
            return null;
        }

        return this.mapToDomain(dbUnit[0] as DbUnit);
    }

    public async findPaginated(query: ReadUnitsQueryDTO): Promise<PaginatedResponseDTO<Unit>> {
        const { page = 1, limit = 10, search } = query;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (query.isActive !== undefined) {
            conditions.push(eq(unitsTable.isActive, query.isActive));
        }

        if (query.name) {
            conditions.push(ilike(unitsTable.name, `%${query.name}%`));
        }

        if (query.state) {
            conditions.push(ilike(unitsTable.state, `%${query.state}%`));
        }

        if (query.city) {
            conditions.push(ilike(unitsTable.city, `%${query.city}%`));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(unitsTable.name, `%${search}%`),
                    ilike(unitsTable.city, `%${search}%`),
                    ilike(unitsTable.state, `%${search}%`)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [totalResult] = await db
            .select({ count: count() })
            .from(unitsTable)
            .where(whereClause);

        const totalItems = totalResult.count;

        const dbUnits = await db
            .select()
            .from(unitsTable)
            .where(whereClause)
            .limit(limit)
            .offset(offset);

        const units: Unit[] = dbUnits.map(row => {
            return this.mapToDomain(
                row as DbUnit
            );
        });

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: units,
            total: totalItems,
            page,
            limit,
            totalPages,
        };
    }
    private mapToDomain(dbUnit: DbUnit): Unit {
        return Unit.create({
            id: dbUnit.id,
            name: dbUnit.name,
            city: dbUnit.city,
            state: State.create(dbUnit.state),
            isActive: dbUnit.isActive,
        });
    }
}
export { DrizzleUnitRepository };