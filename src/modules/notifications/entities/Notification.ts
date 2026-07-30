import { Cpf } from '#shared/domain/value-objects/Cpf';
import { SusCard } from '#shared/domain/value-objects/SusCard';
import { BirthDate } from '#shared/domain/value-objects/BirthDate';
import { Gender, EducationLevel, RaceColor } from '#shared/domain/enums/PatientEnums';

type NotificationBaseProps = {
    id?: string;
    patientId: string;
    patientName: string;
    patientCpf: Cpf;
    patientBirthDate: BirthDate;
    patientGender: Gender;
    patientRaceColor: RaceColor;
    patientEducationLevel: EducationLevel;
    patientSusCardNumber: SusCard;
    patientBirthCity: string;
    patientCurrentAddress: string;
    unitId: string;
    notificationTypeSlug: string;
    status: string;
    notificationDate: Date;
    occurrenceDate: Date;
    notes?: string;
};

type NotificationProps<TDiseaseDetails = Record<string, unknown>> = NotificationBaseProps & {
    specificFields: TDiseaseDetails;
};

class Notification<TDiseaseDetails = Record<string, unknown>> {
    private readonly props: NotificationBaseProps;
    private readonly _specificFields: TDiseaseDetails;

    constructor(props: NotificationProps<TDiseaseDetails>) {
        const { specificFields, ...baseProps } = props;
        this.props = baseProps;
        this._specificFields = specificFields;
    }

    get id(): string | undefined { return this.props.id; }
    get patientId(): string { return this.props.patientId; }
    get patientName(): string { return this.props.patientName; }
    get patientCpf(): Cpf { return this.props.patientCpf; }
    get patientBirthDate(): BirthDate { return this.props.patientBirthDate; }
    get patientGender(): Gender { return this.props.patientGender; }
    get patientRaceColor(): RaceColor { return this.props.patientRaceColor; }
    get patientEducationLevel(): EducationLevel { return this.props.patientEducationLevel; }
    get patientSusCardNumber(): SusCard { return this.props.patientSusCardNumber; }
    get patientBirthCity(): string { return this.props.patientBirthCity; }
    get patientCurrentAddress(): string { return this.props.patientCurrentAddress; }
    get unitId(): string { return this.props.unitId; }
    get notificationTypeSlug(): string { return this.props.notificationTypeSlug; }
    get status(): string { return this.props.status; }
    get notificationDate(): Date { return this.props.notificationDate; }
    get occurrenceDate(): Date { return this.props.occurrenceDate; }
    get notes(): string | undefined { return this.props.notes; }

    get specificFields(): TDiseaseDetails {
        return this._specificFields;
    }

    public static create<T>(props: NotificationProps<T>): Notification<T> {
        return new Notification<T>(props);
    }
}

export { Notification };
export type { NotificationProps, NotificationBaseProps };