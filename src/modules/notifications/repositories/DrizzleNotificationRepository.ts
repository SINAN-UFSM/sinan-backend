import type { NotificationRepositoryPort } from '#modules/notifications/ports/NotificationRepositoryPort';
import { Notification } from '#modules/notifications/entities/Notification';
import type { ReadNotificationsQueryDTO } from '#modules/notifications/ports/NotificationCrudServicePort';

import { db } from '#shared/infra/database/drizzle/connection';
import { notificationsTable } from '#shared/infra/database/drizzle/schema';
import { notificationsBotulismTable } from '#shared/infra/database/drizzle/diseases/notifications_botulism';

import { Cpf } from '#shared/domain/value-objects/Cpf';
import { SusCard } from '#shared/domain/value-objects/SusCard';
import { BirthDate } from '#shared/domain/value-objects/BirthDate';
import type { Gender, EducationLevel, RaceColor } from '#shared/domain/enums/PatientEnums';

import { eq, and, count, asc } from 'drizzle-orm';
import type { Column } from 'drizzle-orm';
import type { PgTable, AnyPgTable } from 'drizzle-orm/pg-core';
import { NotFoundError } from '#shared/errors/HttpErrors';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';

const diseaseTablesRegistry: Record<string, AnyPgTable> = {
    'botulism': notificationsBotulismTable,
};

export class DrizzleNotificationRepository implements NotificationRepositoryPort {

    async create<T = Record<string, unknown>>(notification: Notification<T>): Promise<Notification<T>> {
        return await db.transaction(async (tx) => {
            const baseData = this.toBasePersistence(notification);

            const [dbNotification] = await tx.insert(notificationsTable)
                .values(baseData)
                .returning();

            let specificFieldsDb = {} as T;
            const DiseaseTable = diseaseTablesRegistry[notification.notificationTypeSlug];

            if (DiseaseTable && notification.specificFields) {
                const specificData = {
                    notificationId: dbNotification.id,
                    ...(notification.specificFields as object)
                };

                const diseasePgTable = DiseaseTable as unknown as PgTable;

                const [insertedSpecific] = await (tx.insert(diseasePgTable)
                    .values(specificData as Record<string, unknown>)
                    .returning() as unknown as Promise<Record<string, unknown>[]>);

                if (insertedSpecific) {
                    const cleanSpecific = { ...insertedSpecific };
                    delete cleanSpecific.notificationId;
                    delete cleanSpecific.notification_id;
                    specificFieldsDb = cleanSpecific as T;
                }
            }

            return this.mapToDomain<T>(dbNotification, specificFieldsDb);
        });
    }

    async update<T = Record<string, unknown>>(id: string, notification: Notification<T>): Promise<Notification<T>> {
        return await db.transaction(async (tx) => {
            const baseData = this.toBasePersistence(notification);

            const [dbNotification] = await tx.update(notificationsTable)
                .set(baseData)
                .where(eq(notificationsTable.id, id))
                .returning();

            let specificFieldsDb = {} as T;
            const DiseaseTable = diseaseTablesRegistry[notification.notificationTypeSlug];

            if (DiseaseTable && notification.specificFields) {
                const specificData = { ...(notification.specificFields as object) };

                const diseaseTableSchema = DiseaseTable as unknown as Record<string, Column>;
                const notificationIdCol = diseaseTableSchema.notificationId || diseaseTableSchema.notification_id;

                const diseasePgTable = DiseaseTable as unknown as PgTable;

                const [updatedSpecific] = await (tx.update(diseasePgTable)
                    .set(specificData as Record<string, unknown>)
                    .where(eq(notificationIdCol, id))
                    .returning() as unknown as Promise<Record<string, unknown>[]>);

                if (updatedSpecific) {
                    const cleanSpecific = { ...updatedSpecific };
                    delete cleanSpecific.notificationId;
                    delete cleanSpecific.notification_id;
                    specificFieldsDb = cleanSpecific as T;
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
            .where(eq(notificationsTable.id, id))
            .limit(1);

        if (!dbNotification) {
            return null;
        }

        let specificFields = {} as T;

        const slug = dbNotification.notificationTypeSlug;
        const DiseaseTable = diseaseTablesRegistry[slug];

        if (DiseaseTable) {
            const diseaseTableSchema = DiseaseTable as unknown as Record<string, Column>;
            const notificationIdCol = diseaseTableSchema.notificationId || diseaseTableSchema.notification_id;

            const diseasePgTable = DiseaseTable as unknown as PgTable;

            const [diseaseRecord] = await (db.select()
                .from(diseasePgTable)
                .where(eq(notificationIdCol, id))
                .limit(1) as unknown as Promise<Record<string, unknown>[]>);

            if (diseaseRecord) {
                const cleanSpecific = { ...diseaseRecord };
                delete cleanSpecific.notificationId;
                delete cleanSpecific.notification_id;
                specificFields = cleanSpecific as T;
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
            .orderBy(asc(notificationsTable.dtNotification))
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
        return {
            ...(notification.id ? { id: notification.id } : {}),
            patientId: notification.patientId,
            unitId: Number(notification.unitId),
            patientName: notification.patientName,
            patientCpf: notification.patientCpf.value,
            patientSusCard: notification.patientSusCardNumber.value,
            patientBirthDate: notification.patientBirthDate.value.toISOString().split('T')[0],
            patientBirthCity: notification.patientBirthCity,
            patientGender: notification.patientGender,
            patientEducationLevel: notification.patientEducationLevel,
            patientRaceColor: notification.patientRaceColor,
            patientCurrentAddress: notification.patientCurrentAddress,
            notificationTypeSlug: notification.notificationTypeSlug,
            status: notification.status,
            dtNotification: notification.notificationDate.toISOString().split('T')[0],
            occurrenceDate: notification.occurrenceDate.toISOString().split('T')[0],
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
            patientBirthDate: BirthDate.create(dbNotification.patientBirthDate),
            patientGender: dbNotification.patientGender as Gender,
            patientEducationLevel: dbNotification.patientEducationLevel as EducationLevel,
            patientRaceColor: dbNotification.patientRaceColor as RaceColor,
            patientBirthCity: dbNotification.patientBirthCity,
            patientCurrentAddress: dbNotification.patientCurrentAddress,

            unitId: String(dbNotification.unitId),
            notificationTypeSlug: dbNotification.notificationTypeSlug,
            status: dbNotification.status,
            notificationDate: new Date(dbNotification.dtNotification),
            occurrenceDate: new Date(dbNotification.occurrenceDate),
            notes: dbNotification.notes || undefined,

            specificFields,
        });
    }
}