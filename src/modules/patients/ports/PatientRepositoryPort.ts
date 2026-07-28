import { Patient } from "#modules/patients/entities/Patient";
import type { PaginatedResponseDTO } from "#shared/dtos/paginated-query.dto";
import type { ReadPatientsQueryDTO } from "#modules/patients/ports/PatientCrudServicePort";

interface PatientRepositoryPort {
    create(patient: Patient): Promise<Patient>;
    update(patientId: string, patient: Patient): Promise<Patient>;
    delete(patientId: string): Promise<void>;
    findById(patientId: string): Promise<Patient | null>;
    findPaginated(query: ReadPatientsQueryDTO): Promise<PaginatedResponseDTO<Patient>>;
}

export type { PatientRepositoryPort };