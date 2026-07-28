import { UnitCrudController } from "#modules/units/controllers/UnitCrudController";
import { UnitCrudService } from "#modules/units/services/UnitCrudService";
import { DrizzleUnitRepository } from "#modules/units/repositories/DrizzleUnitRepository";

export const makeUnitCrudController = (): UnitCrudController => {
    const unitCrudService = new UnitCrudService(
        new DrizzleUnitRepository(),
    );
    const unitCrudController = new UnitCrudController(unitCrudService);

    return unitCrudController;
}