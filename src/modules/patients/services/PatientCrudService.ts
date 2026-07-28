import { Patient } from "#modules/patients/entities/Patient";
import type { PatientRepositoryPort } from "#modules/patients/ports/PatientRepositoryPort";
import type { PatientCrudServicePort, PatientResponseDTO, UpdatePatientRequestDTO, CreatePatientRequestDTO, ReadPatientsQueryDTO } from "#modules/patients/ports/PatientCrudServicePort";

import { Cpf } from "#modules/patients/value-objects/Cpf";
import { SusCard } from "#modules/patients/value-objects/SusCard";
import { BirthDate } from "#modules/patients/value-objects/BirthDate";
import { Phone } from "#modules/patients/value-objects/Phone";
import { NotFoundError } from "#shared/errors/HttpErrors";
import type { PaginatedResponseDTO } from "#shared/dtos/paginated-query.dto";

export class PatientCrudService implements PatientCrudServicePort {
    private patientRepository: PatientRepositoryPort;

    constructor(patientRepository: PatientRepositoryPort) {
        this.patientRepository = patientRepository;
    }

    async createPatient(patient: CreatePatientRequestDTO): Promise<PatientResponseDTO> {
        const cpf = Cpf.create(patient.cpf);
        const susCard = SusCard.create(patient.susCard);
        const birthDate = BirthDate.create(patient.birthDate);
        const phone = Phone.create(patient.phone);

        const newPatient = Patient.create({
            name: patient.name,
            cpf,
            susCard,
            birthDate,
            birthCity: patient.birthCity,
            phone,
            gender: patient.gender,
            educationLevel: patient.educationLevel,
            raceColor: patient.raceColor,
            currentAddress: patient.currentAddress,
            isActive: true,
        });

        const dbPatient = await this.patientRepository.create(newPatient);
        const patientResponse: PatientResponseDTO = {
            id: dbPatient.id as string,
            name: dbPatient.name,
            cpf: dbPatient.cpf.value,
            susCard: dbPatient.susCard.value,
            birthDate: dbPatient.birthDate.value,
            birthCity: dbPatient.birthCity,
            phone: dbPatient.phone.value,
            gender: dbPatient.gender,
            educationLevel: dbPatient.educationLevel,
            raceColor: dbPatient.raceColor,
            currentAddress: dbPatient.currentAddress,
        }

        return patientResponse;
    }

    async updatePatient(patientId: string, request: UpdatePatientRequestDTO): Promise<PatientResponseDTO> {
        const existingPatient = await this.patientRepository.findById(patientId);
        if (!existingPatient) {
            throw new NotFoundError(`Patient with ID ${patientId} not found`);
        }

        const updatedPatientEntity = Patient.create({
            id: existingPatient.id,
            name: request.name ?? existingPatient.name,
            cpf: request.cpf ? Cpf.create(request.cpf) : existingPatient.cpf,
            susCard: request.susCard ? SusCard.create(request.susCard) : existingPatient.susCard,
            birthDate: request.birthDate ? BirthDate.create(request.birthDate) : existingPatient.birthDate,
            birthCity: request.birthCity ?? existingPatient.birthCity,
            phone: request.phone ? Phone.create(request.phone) : existingPatient.phone,
            gender: request.gender ?? existingPatient.gender,
            educationLevel: request.educationLevel ?? existingPatient.educationLevel,
            raceColor: request.raceColor ?? existingPatient.raceColor,
            currentAddress: request.currentAddress ?? existingPatient.currentAddress,
            isActive: existingPatient.isActive,
        });

        const dbPatient = await this.patientRepository.update(patientId, updatedPatientEntity);

        return {
            id: dbPatient.id as string,
            name: dbPatient.name,
            cpf: dbPatient.cpf.value,
            susCard: dbPatient.susCard.value,
            birthDate: dbPatient.birthDate.value,
            birthCity: dbPatient.birthCity,
            phone: dbPatient.phone.value,
            gender: dbPatient.gender,
            educationLevel: dbPatient.educationLevel,
            raceColor: dbPatient.raceColor,
            currentAddress: dbPatient.currentAddress,
        };
    }

    async deletePatient(patientId: string): Promise<void> {
        const existingPatient = await this.patientRepository.findById(patientId);
        if (!existingPatient) {
            throw new NotFoundError(`Patient with ID ${patientId} not found`);
        }

        await this.patientRepository.delete(patientId);
    }

    async readPatient(patientId: string): Promise<PatientResponseDTO | null> {
        const dbPatient = await this.patientRepository.findById(patientId);
        if (!dbPatient) {
            throw new NotFoundError(`Patient with ID ${patientId} not found`);
        }

        const patientResponse: PatientResponseDTO = {
            id: dbPatient.id as string,
            name: dbPatient.name,
            cpf: dbPatient.cpf.value,
            susCard: dbPatient.susCard.value,
            birthDate: dbPatient.birthDate.value,
            birthCity: dbPatient.birthCity,
            phone: dbPatient.phone.value,
            gender: dbPatient.gender,
            educationLevel: dbPatient.educationLevel,
            raceColor: dbPatient.raceColor,
            currentAddress: dbPatient.currentAddress,
        };

        return patientResponse;
    }

    async readPatients(queryDTO: ReadPatientsQueryDTO): Promise<PaginatedResponseDTO<PatientResponseDTO>> {
        const paginatedPatients = await this.patientRepository.findPaginated(queryDTO);

        const patientResponses: PatientResponseDTO[] = paginatedPatients.data.map((dbPatient) => ({
            id: dbPatient.id as string,
            name: dbPatient.name,
            cpf: dbPatient.cpf.value,
            susCard: dbPatient.susCard.value,
            birthDate: dbPatient.birthDate.value,
            birthCity: dbPatient.birthCity,
            phone: dbPatient.phone.value,
            gender: dbPatient.gender,
            educationLevel: dbPatient.educationLevel,
            raceColor: dbPatient.raceColor,
            currentAddress: dbPatient.currentAddress,
        }));

        return {
            data: patientResponses,
            total: paginatedPatients.total,
            page: paginatedPatients.page,
            limit: paginatedPatients.limit,
            totalPages: paginatedPatients.totalPages,
        };
    }
}
