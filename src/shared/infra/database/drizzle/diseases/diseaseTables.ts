import type { AnyColumn } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { notificationsBotulismTable } from '#shared/infra/database/drizzle/diseases/notifications_botulism';

export interface DiseaseTableConfig {
    table: PgTable;
    notificationIdColumn: AnyColumn;
}

export const diseaseTablesRegistry: Record<string, DiseaseTableConfig> = {
    'botulism': {
        table: notificationsBotulismTable as unknown as PgTable,
        notificationIdColumn: (notificationsBotulismTable as any).notificationId
            || (notificationsBotulismTable as any).notification_id,
    },
};

export function stripNotificationId<T>(record: Record<string, any>): T {
    const { notificationId, notification_id, ...cleanRecord } = record;
    return cleanRecord as T;
}