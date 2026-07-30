import { Notification } from '#modules/notifications/entities/Notification';
import type { NotificationRepositoryPort } from '#modules/notifications/ports/NotificationRepositoryPort';
import type { PatientRepositoryPort } from '#modules/patients/ports/PatientRepositoryPort';
import type {
    NotificationCrudServicePort,
    NotificationResponseDTO,
    UpdateNotificationRequestDTO,
    CreateNotificationRequestDTO,
    ReadNotificationsQueryDTO
} from '#modules/notifications/ports/NotificationCrudServicePort';

import { Cpf } from '#shared/domain/value-objects/Cpf';
import { SusCard } from '#shared/domain/value-objects/SusCard';
import { BirthDate } from '#shared/domain/value-objects/BirthDate';

import { BadRequestError, NotFoundError } from '#shared/errors/HttpErrors';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';

export class NotificationCrudService implements NotificationCrudServicePort {
    private notificationRepository: NotificationRepositoryPort;
    private patientRepository: PatientRepositoryPort;

    constructor(
        notificationRepository: NotificationRepositoryPort,
        patientRepository: PatientRepositoryPort
    ) {
        this.notificationRepository = notificationRepository;
        this.patientRepository = patientRepository;
    }

    async createNotification(dto: CreateNotificationRequestDTO): Promise<NotificationResponseDTO> {
        const patient = await this.patientRepository.findById(dto.patientId);
        if (!patient) {
            throw new NotFoundError(`Patient with ID ${dto.patientId} not found`);
        }

        const newNotification = Notification.create({
            patientId: patient.id as string,
            patientName: patient.name,
            patientCpf: Cpf.create(patient.cpf.value),
            patientBirthDate: BirthDate.create(patient.birthDate.value),
            patientSusCardNumber: SusCard.create(patient.susCard.value),
            patientGender: patient.gender,
            patientRaceColor: patient.raceColor,
            patientEducationLevel: patient.educationLevel,
            patientBirthCity: patient.birthCity,
            patientCurrentAddress: patient.currentAddress,

            unitId: dto.unitId,
            notificationTypeSlug: dto.notificationTypeSlug,
            status: dto.status || 'ACTIVE',
            notificationDate: new Date(dto.dtNotification),
            occurrenceDate: new Date(dto.occurrenceDate),
            notes: dto.notes,
            specificFields: dto.specificFields,
        });
        const dbNotification = await this.notificationRepository.create(newNotification);

        return this.toResponseDTO(dbNotification);
    }

    async updateNotification(dto: UpdateNotificationRequestDTO): Promise<NotificationResponseDTO> {
        const existingNotification = await this.notificationRepository.findById(dto.id);

        if (!existingNotification) {
            throw new NotFoundError('Notification not found');
        }
        if (dto.notificationTypeSlug && dto.notificationTypeSlug !== existingNotification.notificationTypeSlug) {
            throw new BadRequestError(
                `Cannot update notification type from '${existingNotification.notificationTypeSlug}' to '${dto.notificationTypeSlug}'. Type migration is not allowed.`
            );
        }

        const updatedNotificationEntity = Notification.create({
            id: existingNotification.id,
            patientId: existingNotification.patientId,
            patientName: existingNotification.patientName,
            patientCpf: existingNotification.patientCpf,
            patientBirthDate: existingNotification.patientBirthDate,
            patientGender: existingNotification.patientGender,
            patientRaceColor: existingNotification.patientRaceColor,
            patientEducationLevel: existingNotification.patientEducationLevel,
            patientSusCardNumber: existingNotification.patientSusCardNumber,
            patientBirthCity: existingNotification.patientBirthCity,
            patientCurrentAddress: existingNotification.patientCurrentAddress,

            unitId: dto.unitId ?? existingNotification.unitId,
            notificationTypeSlug: existingNotification.notificationTypeSlug,

            status: dto.status || existingNotification.status,
            notificationDate: dto.dtNotification ? new Date(dto.dtNotification) : existingNotification.notificationDate,
            occurrenceDate: dto.occurrenceDate ? new Date(dto.occurrenceDate) : existingNotification.occurrenceDate,
            notes: dto.notes !== undefined ? dto.notes : existingNotification.notes,

            specificFields: {
                ...(existingNotification.specificFields as Record<string, unknown>),
                ...(dto.specificFields || {})
            }
        });

        const dbNotification = await this.notificationRepository.update(dto.id, updatedNotificationEntity);

        return this.toResponseDTO(dbNotification);
    }

    async deleteNotification(id: string): Promise<void> {
        const existingNotification = await this.notificationRepository.findById(id);
        if (!existingNotification) {
            throw new NotFoundError(`Notification with ID ${id} not found`);
        }

        await this.notificationRepository.delete(id);
    }

    async readNotification(id: string): Promise<NotificationResponseDTO> {
        const dbNotification = await this.notificationRepository.findById(id);
        if (!dbNotification) {
            throw new NotFoundError(`Notification with ID ${id} not found`);
        }

        return this.toResponseDTO(dbNotification);
    }

    async readNotifications(queryDTO: ReadNotificationsQueryDTO): Promise<PaginatedResponseDTO<NotificationResponseDTO>> {
        const paginatedNotifications = await this.notificationRepository.findPaginated(queryDTO);

        const notificationResponses: NotificationResponseDTO[] = paginatedNotifications.data.map((dbNotification) =>
            this.toResponseDTO(dbNotification)
        );

        return {
            data: notificationResponses,
            total: paginatedNotifications.total,
            page: paginatedNotifications.page,
            limit: paginatedNotifications.limit,
            totalPages: paginatedNotifications.totalPages,
        };
    }

    private toResponseDTO(notification: Notification<unknown>): NotificationResponseDTO {
        const formatSafeDate = (dateValue: unknown): string => {
            if (!dateValue) return '';
            const dateObj = new Date(dateValue as string | number | Date);
            return isNaN(dateObj.getTime()) ? '' : dateObj.toISOString();
        };

        return {
            id: notification.id as string,
            patientId: notification.patientId,

            patientName: notification.patientName,
            patientCpf: notification.patientCpf.value,

            notificationTypeSlug: notification.notificationTypeSlug,

            dtNotification: formatSafeDate(notification.notificationDate),
            occurrenceDate: formatSafeDate(notification.occurrenceDate),
            status: notification.status,
            notes: notification.notes,

            unitId: notification.unitId ? notification.unitId : undefined,
            specificFields: notification.specificFields as Record<string, unknown>,
        };
    }
}