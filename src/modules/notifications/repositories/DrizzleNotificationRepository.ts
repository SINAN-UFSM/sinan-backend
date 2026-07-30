import type { NotificationRepositoryPort } from '#modules/notifications/ports/NotificationRepositoryPort';
import { Notification } from '#modules/notifications/entities/Notification';
import type { ReadNotificationsQueryDTO } from '#modules/notifications/ports/NotificationCrudServicePort';

import { db } from '#shared/infra/database/drizzle/connection';
import { notificationsTable } from '#shared/infra/database/drizzle/schema';
import {
    diseaseTablesRegistry,
    stripNotificationId
} from '#shared/infra/database/drizzle/diseases/diseaseTables';

import { Cpf } from '#shared/domain/value-objects/Cpf';
import { SusCard } from '#shared/domain/value-objects/SusCard';
import { BirthDate } from '#shared/domain/value-objects/BirthDate';
import type { Gender, EducationLevel, RaceColor } from '#shared/domain/enums/PatientEnums';

import { eq, and, count, asc } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

import { BadRequestError, NotFoundError } from '#shared/errors/HttpErrors';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';



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
            const baseData = this.toBasePersistence(notification);

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
            const baseData = this.toBasePersistence(notification);

            const [dbNotification] = await tx.update(notificationsTable)
                .set(baseData)
                .where(eq(notificationsTable.id, id))
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
                    notificationId: id,
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
            .where(eq(notificationsTable.id, id))
            .returning({ id: notificationsTable.id });

        if (!deleted) {
            throw new NotFoundError(`Notification with ID ${id} not found`);
        }
    }

    async findById<T = Record<string, unknown>>(id: string): Promise<Notification<T> | null> {
        const [dbNotification] = await db.select()
            .from(notificationsTable)
            .where(
                and(
                    eq(notificationsTable.id, id),
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
                .where(eq(diseaseConfig.notificationIdColumn, id))
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

        if (patientId) conditions.push(eq(notificationsTable.patientId, patientId));
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

        const notifications: Notification[] = dbRecords.map(row =>
            this.mapToDomain(row, {})
        );

        return {
            data: notifications,
            total: totalItems,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
        };
    }

    private toBasePersistence(notification: Notification<unknown>): typeof notificationsTable.$inferInsert {
        const unitIdNumber = Number(notification.unitId);
        if (isNaN(unitIdNumber)) {
            throw new BadRequestError(`Invalid health unit ID: '${notification.unitId}' is not a valid number`);
        }

        return {
            ...(notification.id ? { id: notification.id } : {}),
            patientId: notification.patientId,
            unitId: unitIdNumber,
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

    private mapToDomain<T>(dbNotification: typeof notificationsTable.$inferSelect, specificFields: T): Notification<T> {
        return Notification.create<T>({
            id: dbNotification.id,
            patientId: dbNotification.patientId,
            patientName: dbNotification.patientName,
            patientCpf: Cpf.create(dbNotification.patientCpf),
            patientSusCardNumber: SusCard.create(dbNotification.patientSusCard),
            patientBirthDate: BirthDate.create(parseDateAsUtc(dbNotification.patientBirthDate)),
            patientGender: dbNotification.patientGender as Gender,
            patientEducationLevel: dbNotification.patientEducationLevel as EducationLevel,
            patientRaceColor: dbNotification.patientRaceColor as RaceColor,
            patientBirthCity: dbNotification.patientBirthCity,
            patientCurrentAddress: dbNotification.patientCurrentAddress,

            unitId: String(dbNotification.unitId),
            notificationTypeSlug: dbNotification.notificationTypeSlug,
            status: dbNotification.status,
            notificationDate: parseDateAsUtc(dbNotification.dtNotification),
            occurrenceDate: parseDateAsUtc(dbNotification.occurrenceDate),
            notes: dbNotification.notes || undefined,

            specificFields,
        });
    }
}