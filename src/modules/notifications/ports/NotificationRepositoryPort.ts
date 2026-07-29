import { Notification } from '#modules/notifications/entities/Notification';
import type { ReadNotificationsQueryDTO } from '#modules/notifications/ports/NotificationCrudServicePort';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';

export interface NotificationRepositoryPort {
    create<T = Record<string, unknown>>(notification: Notification<T>): Promise<Notification<T>>;
    findById<T = Record<string, unknown>>(id: string): Promise<Notification<T> | null>;
    update<T = Record<string, unknown>>(id: string, notification: Notification<T>): Promise<Notification<T>>;
    delete(id: string): Promise<void>;
    findPaginated(query: ReadNotificationsQueryDTO): Promise<PaginatedResponseDTO<Notification>>;
}