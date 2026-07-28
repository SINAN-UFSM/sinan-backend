import { z } from 'zod';
import { Gender, RaceColor, EducationLevel } from '#modules/patients/entities/Patient';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';

export const createPatientSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    cpf: z.string().min(11, 'CPF must be at least 11 digits long').max(20, 'Invalid CPF format'),
    susCard: z.string().min(15, 'SUS Card must be at least 15 digits long').max(30, 'Invalid SUS Card format'),

    birthDate: z.coerce.date({
        error: "Birth date is required",
        message: "Invalid birth date"
    }),

    birthCity: z.string().min(1, 'Birth city is required'),
    phone: z.string().min(10, 'Invalid phone number').max(20, 'Invalid phone format'),

    gender: z.enum(Gender, { message: 'Invalid gender' }),
    educationLevel: z.enum(EducationLevel, { message: 'Invalid education level' }),
    raceColor: z.enum(RaceColor, { message: 'Invalid race/color' }),

    currentAddress: z.string().min(5, 'Current address is required'),
});

export const updatePatientSchema = createPatientSchema.partial();

export const readPatientsQuerySchema = z.object({
    name: z.string().optional(),
    cpf: z.string().optional(),
    susCard: z.string().optional(),
    birthCity: z.string().optional(),
    phone: z.string().optional(),
    gender: z.enum(Gender).optional(),
    educationLevel: z.enum(EducationLevel).optional(),
    raceColor: z.enum(RaceColor).optional(),
    currentAddress: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
});

export type CreatePatientRequestDTO = z.infer<typeof createPatientSchema>;
export type UpdatePatientRequestDTO = z.infer<typeof updatePatientSchema>;

export type ReadPatientsQueryDTO = z.infer<typeof readPatientsQuerySchema>;

export type PatientResponseDTO = {
    id: string;
    name: string;
    cpf: string;
    susCard: string;
    birthDate: Date;
    birthCity: string;
    phone: string;
    gender: Gender;
    educationLevel: EducationLevel;
    raceColor: RaceColor;
    currentAddress: string;
};

export interface PatientCrudServicePort {
    createPatient(request: CreatePatientRequestDTO): Promise<PatientResponseDTO>;
    updatePatient(patientId: string, request: UpdatePatientRequestDTO): Promise<PatientResponseDTO>;
    deletePatient(patientId: string): Promise<void>;
    readPatient(patientId: string): Promise<PatientResponseDTO>;
    readPatients(queryDTO: ReadPatientsQueryDTO): Promise<PaginatedResponseDTO<PatientResponseDTO>>;

}