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
        notificationIdColumn: (notificationsBotulismTable as unknown as Record<string, AnyColumn>).notificationId
            || (notificationsBotulismTable as unknown as Record<string, AnyColumn>).notification_id,
    },
};

export function stripNotificationId<T>(record: Record<string, unknown>): T {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { notificationId: _, notification_id: __, ...cleanRecord } = record;
    return cleanRecord as T;
}