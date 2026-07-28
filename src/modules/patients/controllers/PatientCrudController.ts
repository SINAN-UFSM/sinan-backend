import type { Request, Response, NextFunction } from 'express';
import type { PatientCrudServicePort, PatientResponseDTO, UpdatePatientRequestDTO, CreatePatientRequestDTO, ReadPatientsQueryDTO } from '#modules/patients/ports/PatientCrudServicePort';
import { createPatientSchema, readPatientsQuerySchema, updatePatientSchema } from '#modules/patients/ports/PatientCrudServicePort';
import { uuidParamSchema } from '#shared/validators/common.validator';
export class PatientCrudController {
    private patientService: PatientCrudServicePort;

    constructor(patientService: PatientCrudServicePort) {
        this.patientService = patientService;
    }

    async createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const patientDTO: CreatePatientRequestDTO = createPatientSchema.parse(req.body);
            const patient: PatientResponseDTO = await this.patientService.createPatient(patientDTO);

            res.status(201).json(patient);

        } catch (error: unknown) {
            next(error);
        }
    }

    async updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = uuidParamSchema.parse(req.params);
            const patientDTO: UpdatePatientRequestDTO = updatePatientSchema.parse(req.body);

            const updatedPatient: PatientResponseDTO = await this.patientService.updatePatient(id, patientDTO);
            res.status(200).json(updatedPatient);

        } catch (error: unknown) {
            next(error);
        }
    }

    async deletePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = uuidParamSchema.parse(req.params);
            await this.patientService.deletePatient(id);
            res.status(204).send();
        } catch (error: unknown) {
            next(error);
        }
    }

    async getPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = uuidParamSchema.parse(req.params);
            const patient: PatientResponseDTO | null = await this.patientService.readPatient(id);

            res.status(200).json(patient);
        } catch (error: unknown) {
            next(error);
        }
    }

    async getPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const queryDTO: ReadPatientsQueryDTO = readPatientsQuerySchema.parse(req.query);
            const patients = await this.patientService.readPatients(queryDTO);
            res.status(200).json(patients);
        } catch (error: unknown) {
            next(error);
        }
    }
}