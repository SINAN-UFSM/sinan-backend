import type { PatientRepositoryPort } from "#modules/patients/ports/PatientRepositoryPort";
import { Patient } from "#modules/patients/entities/Patient";
import type { Gender, EducationLevel, RaceColor } from "#modules/patients/entities/Patient";
import { Phone } from "#modules/patients/value-objects/Phone";
import { BirthDate } from "#modules/patients/value-objects/BirthDate";
import { SusCard } from "#modules/patients/value-objects/SusCard";
import { Cpf } from "#modules/patients/value-objects/Cpf";
import { patientsTable } from "#shared/infra/database/drizzle/schema";
import type { DbPatient } from "#shared/infra/database/drizzle/schema";
import { db } from '#shared/infra/database/drizzle/connection';
import { eq, ilike, or, and, count, asc } from 'drizzle-orm';
import { NotFoundError } from "#shared/errors/HttpErrors";
import type { PaginatedResponseDTO } from "#shared/dtos/paginated-query.dto";
import type { ReadPatientsQueryDTO } from "#modules/patients/ports/PatientCrudServicePort";

class DrizzlePatientRepository implements PatientRepositoryPort {
    async create(patient: Patient): Promise<Patient> {
        const patientData = {
            name: patient.name,
            cpf: patient.cpf.value,
            susCard: patient.susCard.value,
            birthDate: patient.birthDate.value,
            birthCity: patient.birthCity,
            phone: patient.phone.value,
            gender: patient.gender,
            educationLevel: patient.educationLevel,
            raceColor: patient.raceColor,
            currentAddress: patient.currentAddress,
            isActive: patient.isActive,
        }

        const [dbPatient] = await db.insert(patientsTable)
            .values(patientData)
            .returning();

        return this.mapToDomain(dbPatient);
    }

    async update(patientId: string, patient: Patient): Promise<Patient> {
        const patientData = {
            name: patient.name,
            cpf: patient.cpf.value,
            susCard: patient.susCard.value,
            birthDate: patient.birthDate.value,
            birthCity: patient.birthCity,
            phone: patient.phone.value,
            gender: patient.gender,
            educationLevel: patient.educationLevel,
            raceColor: patient.raceColor,
            currentAddress: patient.currentAddress,
            isActive: patient.isActive,
        }
        const [dbPatient] = await db.update(patientsTable)
            .set(patientData)
            .where(eq(patientsTable.id, patientId))
            .returning();

        return this.mapToDomain(dbPatient);
    }

    async delete(patientId: string): Promise<void> {
        const result = await db.update(patientsTable)
            .set({ isActive: false })
            .where(eq(patientsTable.id, patientId));

        if (result.rowCount === 0) {
            throw new NotFoundError(`Patient with ID ${patientId} not found`);
        }
    }

    async findById(patientId: string): Promise<Patient | null> {
        const dbPatient = await db.select()
            .from(patientsTable)
            .where(eq(patientsTable.id, patientId))
            .limit(1);

        if (dbPatient.length === 0) {
            return null;
        }

        return this.mapToDomain(dbPatient[0]);
    }

    async findPaginated(query: ReadPatientsQueryDTO): Promise<PaginatedResponseDTO<Patient>> {
        const { page = 1, limit = 10, search } = query;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (query.isActive !== undefined) {
            conditions.push(eq(patientsTable.isActive, query.isActive));
        }

        if (query.name) {
            conditions.push(ilike(patientsTable.name, `%${query.name}%`));
        }

        if (query.cpf) {
            conditions.push(ilike(patientsTable.cpf, `%${query.cpf}%`));
        }

        if (query.susCard) {
            conditions.push(ilike(patientsTable.susCard, `%${query.susCard}%`));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(patientsTable.name, `%${search}%`),
                    ilike(patientsTable.cpf, `%${search}%`),
                    ilike(patientsTable.susCard, `%${search}%`)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [totalResult] = await db
            .select({ count: count() })
            .from(patientsTable)
            .where(whereClause);

        const totalItems = totalResult.count;

        const dbPatients = await db
            .select()
            .from(patientsTable)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(asc(patientsTable.name));

        const patients: Patient[] = dbPatients.map(row => this.mapToDomain(row as DbPatient));

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: patients,
            total: totalItems,
            page,
            limit,
            totalPages,
        };
    }

    private mapToDomain(dbPatient: DbPatient): Patient {
        const cpf = Cpf.create(dbPatient.cpf);
        const susCard = SusCard.create(dbPatient.susCard);
        const birthDate = BirthDate.create(dbPatient.birthDate);
        const phone = Phone.create(dbPatient.phone);
        return Patient.reconstitute({
            id: dbPatient.id,
            name: dbPatient.name,
            cpf,
            susCard,
            birthDate,
            birthCity: dbPatient.birthCity,
            phone,
            gender: dbPatient.gender as Gender,
            educationLevel: dbPatient.educationLevel as EducationLevel,
            raceColor: dbPatient.raceColor as RaceColor,
            currentAddress: dbPatient.currentAddress,
            isActive: dbPatient.isActive,
        });
    }
}

export { DrizzlePatientRepository };