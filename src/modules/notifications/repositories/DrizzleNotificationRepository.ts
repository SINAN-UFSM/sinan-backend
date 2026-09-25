import type { NotificationRepositoryPort } from '#modules/notifications/ports/NotificationRepositoryPort';
import { Notification } from '#modules/notifications/entities/Notification';
import type { ReadNotificationsQueryDTO } from '#modules/notifications/ports/NotificationCrudServicePort';

import { db } from '#shared/infra/database/drizzle/connection';
import { notificationsTable, patientsTable, unitsTable } from '#shared/infra/database/drizzle/schema';
import {
    diseaseTablesRegistry,
    stripNotificationId
} from '#shared/infra/database/drizzle/diseases/diseaseTables';

import { Cpf } from '#shared/domain/value-objects/Cpf';
import { SusCard } from '#shared/domain/value-objects/SusCard';
import { BirthDate } from '#shared/domain/value-objects/BirthDate';
import type { Gender, EducationLevel, RaceColor } from '#shared/domain/enums/PatientEnums';

import { BadRequestError, NotFoundError } from '#shared/errors/HttpErrors';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';

import { eq, and, count, asc } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

function formatDateToUtcString(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateAsUtc(dateInput: string | Date): Date {
    if (dateInput instanceof Date) {
        return dateInput;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return new Date(`${dateInput}T00:00:00.000Z`);
    }
    return new Date(dateInput);
}

export class DrizzleNotificationRepository implements NotificationRepositoryPort {

    async create<T = Record<string, unknown>>(notification: Notification<T>): Promise<Notification<T>> {
        if (notification.specificFields && !diseaseTablesRegistry[notification.notificationTypeSlug]) {
            throw new BadRequestError(`Cannot save specific fields: unregistered disease type '${notification.notificationTypeSlug}'`);
        }

        return await db.transaction(async (tx) => {
            const baseData = await this.toBasePersistence(notification);

            const [dbNotification] = await tx.insert(notificationsTable)
                .values(baseData)
                .returning();

            let specificFieldsDb = {} as T;
            const diseaseConfig = diseaseTablesRegistry[notification.notificationTypeSlug];

            if (diseaseConfig && notification.specificFields) {
                const specificData = {
                    notificationId: dbNotification.id,
                    ...(notification.specificFields as object)
                };

                const [insertedSpecific] = await (tx.insert(diseaseConfig.table)
                    .values(specificData as Record<string, unknown>)
                    .returning() as unknown as Promise<Record<string, unknown>[]>);

                if (insertedSpecific) {
                    specificFieldsDb = stripNotificationId<T>(insertedSpecific);
                }
            }

            return this.mapToDomain<T>(dbNotification, specificFieldsDb);
        });
    }

    async update<T = Record<string, unknown>>(id: string, notification: Notification<T>): Promise<Notification<T>> {
        if (notification.specificFields && !diseaseTablesRegistry[notification.notificationTypeSlug]) {
            throw new BadRequestError(`Cannot update specific fields: unregistered disease type '${notification.notificationTypeSlug}'`);
        }

        return await db.transaction(async (tx) => {
            const baseData = await this.toBasePersistence(notification);

            const [dbNotification] = await tx.update(notificationsTable)
                .set(baseData)
                .where(eq(notificationsTable.publicId, id))
                .returning();

            if (!dbNotification) {
                throw new NotFoundError(`Notification with ID ${id} not found`);
            }

            let specificFieldsDb = {} as T;
            const diseaseConfig = diseaseTablesRegistry[notification.notificationTypeSlug];

            if (diseaseConfig && notification.specificFields) {
                if (!diseaseConfig.notificationIdColumn) {
                    throw new Error(`Configuration error: notificationIdColumn is missing for disease type '${notification.notificationTypeSlug}'`);
                }

                const specificData = {
                    notificationId: dbNotification.id,
                    ...(notification.specificFields as object)
                };

                const targetColumn = diseaseConfig.notificationIdColumn as PgColumn;

                const [upsertedSpecific] = await (tx.insert(diseaseConfig.table)
                    .values(specificData as Record<string, unknown>)
                    .onConflictDoUpdate({
                        target: targetColumn,
                        set: specificData as Record<string, unknown>
                    })
                    .returning() as unknown as Promise<Record<string, unknown>[]>);

                if (upsertedSpecific) {
                    specificFieldsDb = stripNotificationId<T>(upsertedSpecific);
                }
            }

            return this.mapToDomain<T>(dbNotification, specificFieldsDb);
        });
    }

    async delete(id: string): Promise<void> {
        const [deleted] = await db.update(notificationsTable)
            .set({ status: 'DELETED' })
            .where(eq(notificationsTable.publicId, id))
            .returning({ publicId: notificationsTable.publicId });

        if (!deleted) {
            throw new NotFoundError(`Notification with ID ${id} not found`);
        }
    }

    async findById<T = Record<string, unknown>>(id: string): Promise<Notification<T> | null> {
        const [dbNotification] = await db.select()
            .from(notificationsTable)
            .where(
                and(
                    eq(notificationsTable.publicId, id),
                    eq(notificationsTable.status, 'ACTIVE')
                )
            )
            .limit(1);

        if (!dbNotification) return null;

        let specificFields = {} as T;
        const diseaseConfig = diseaseTablesRegistry[dbNotification.notificationTypeSlug];

        if (diseaseConfig) {
            const [diseaseRecord] = await (db.select()
                .from(diseaseConfig.table)
                .where(eq(diseaseConfig.notificationIdColumn, dbNotification.id))
                .limit(1) as unknown as Promise<Record<string, unknown>[]>);

            if (diseaseRecord) {
                specificFields = stripNotificationId<T>(diseaseRecord);
            }
        }

        return this.mapToDomain<T>(dbNotification, specificFields);
    }
    async findPaginated(query: ReadNotificationsQueryDTO): Promise<PaginatedResponseDTO<Notification>> {
        const { page = 1, limit = 10, patientId, notificationTypeSlug } = query;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (patientId) {
            const [patient] = await db.select({ id: patientsTable.id })
                .from(patientsTable)
                .where(eq(patientsTable.publicId, patientId));

            conditions.push(eq(notificationsTable.patientId, patient?.id ?? -1));
        }
        if (notificationTypeSlug) conditions.push(eq(notificationsTable.notificationTypeSlug, notificationTypeSlug));
        conditions.push(eq(notificationsTable.status, 'ACTIVE'));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [totalResult] = await db.select({ count: count() })
            .from(notificationsTable)
            .where(whereClause);

        const totalItems = totalResult.count;

        const dbRecords = await db.select()
            .from(notificationsTable)
            .where(whereClause)
            .orderBy(
                asc(notificationsTable.dtNotification),
                asc(notificationsTable.id)
            )
            .limit(limit)
            .offset(offset);

        const notifications: Notification[] = await Promise.all(
            dbRecords.map(row => this.mapToDomain(row, {}))
        );

        return {
            data: notifications,
            total: totalItems,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
        };
    }

    private async toBasePersistence(notification: Notification<unknown>): Promise<typeof notificationsTable.$inferInsert> {
        const [unit] = await db.select({ id: unitsTable.id })
            .from(unitsTable)
            .where(eq(unitsTable.publicId, notification.unitId));

        if (!unit) {
            throw new BadRequestError(`Health unit with ID '${notification.unitId}' was not found`);
        }

        const [patient] = await db.select({ id: patientsTable.id })
            .from(patientsTable)
            .where(eq(patientsTable.publicId, notification.patientId));

        if (!patient) {
            throw new NotFoundError(`Patient with ID ${notification.patientId} not found`);
        }

        return {
            patientId: patient.id,
            unitId: unit.id,
            patientName: notification.patientName,
            patientCpf: notification.patientCpf.value,
            patientSusCard: notification.patientSusCardNumber.value,
            patientBirthDate: formatDateToUtcString(notification.patientBirthDate.value),
            patientBirthCity: notification.patientBirthCity,
            patientGender: notification.patientGender,
            patientEducationLevel: notification.patientEducationLevel,
            patientRaceColor: notification.patientRaceColor,
            patientCurrentAddress: notification.patientCurrentAddress,
            notificationTypeSlug: notification.notificationTypeSlug,
            status: notification.status,
            dtNotification: formatDateToUtcString(notification.notificationDate),
            occurrenceDate: formatDateToUtcString(notification.occurrenceDate),
            notes: notification.notes,
        };
    }

    private async mapToDomain<T>(dbNotification: typeof notificationsTable.$inferSelect, specificFields: T): Promise<Notification<T>> {
        const [patient] = await db.select({ publicId: patientsTable.publicId })
            .from(patientsTable)
            .where(eq(patientsTable.id, dbNotification.patientId));

        const [unit] = await db.select({ publicId: unitsTable.publicId })
            .from(unitsTable)
            .where(eq(unitsTable.id, dbNotification.unitId));

        return Notification.create<T>({
            publicId: dbNotification.publicId,
            patientId: patient?.publicId ?? '',
            patientName: dbNotification.patientName,
            patientCpf: Cpf.create(dbNotification.patientCpf),
            patientSusCardNumber: SusCard.create(dbNotification.patientSusCard),
            patientBirthDate: BirthDate.create(parseDateAsUtc(dbNotification.patientBirthDate)),
            patientGender: dbNotification.patientGender as Gender,
            patientEducationLevel: dbNotification.patientEducationLevel as EducationLevel,
            patientRaceColor: dbNotification.patientRaceColor as RaceColor,
            patientBirthCity: dbNotification.patientBirthCity,
            patientCurrentAddress: dbNotification.patientCurrentAddress,

            unitId: unit?.publicId ?? '',
            notificationTypeSlug: dbNotification.notificationTypeSlug,
            status: dbNotification.status,
            notificationDate: parseDateAsUtc(dbNotification.dtNotification),
            occurrenceDate: parseDateAsUtc(dbNotification.occurrenceDate),
            notes: dbNotification.notes || undefined,

            specificFields,
        });
    }
}