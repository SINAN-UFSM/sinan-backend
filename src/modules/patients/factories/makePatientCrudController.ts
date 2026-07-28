import { PatientCrudController } from '#modules/patients/controllers/PatientCrudController';
import { PatientCrudService } from '#modules/patients/services/PatientCrudService';
import { DrizzlePatientRepository } from '#modules/patients/repositories/DrizzlePatientRepository';


export const makePatientCrudController = (): PatientCrudController => {
    const patientCrudService = new PatientCrudService(
        new DrizzlePatientRepository(),
    );
    const patientCrudController = new PatientCrudController(patientCrudService);

    return patientCrudController;
}