import { Cpf } from '#modules/patients/value-objects/Cpf';
import { SusCard } from '#modules/patients/value-objects/SusCard';
import { BirthDate } from '#modules/patients/value-objects/BirthDate';
import { Phone } from '#modules/patients/value-objects/Phone';
import { Gender, RaceColor, EducationLevel } from '#shared/domain/enums/PatientEnums'
type PatientProps = {
    id?: string;
    name: string;
    cpf: Cpf;
    susCard: SusCard;
    birthDate: BirthDate;
    birthCity: string;
    phone: Phone;
    gender: Gender;
    educationLevel: EducationLevel;
    raceColor: RaceColor;
    currentAddress: string;
    isActive?: boolean;
}

class Patient {
    private readonly props: PatientProps;
    private constructor(props: PatientProps) {
        this.props = props;
    }

    public static create(props: PatientProps): Patient {
        const patient = new Patient({
            ...props,
            isActive: props.isActive ?? true
        });
        return patient;
    }

    public static reconstitute(props: PatientProps): Patient {
        const patient = new Patient(props);
        return patient;
    }

    public get id(): string | undefined {
        return this.props.id;
    }

    public get name(): string {
        return this.props.name;
    }

    public get cpf(): Cpf {
        return this.props.cpf;
    }

    public get susCard(): SusCard {
        return this.props.susCard;
    }

    public get birthDate(): BirthDate {
        return this.props.birthDate;
    }

    public get birthCity(): string {
        return this.props.birthCity;
    }

    public get phone(): Phone {
        return this.props.phone;
    }

    public get gender(): Gender {
        return this.props.gender;
    }

    public get educationLevel(): EducationLevel {
        return this.props.educationLevel;
    }

    public get raceColor(): RaceColor {
        return this.props.raceColor;
    }

    public get currentAddress(): string {
        return this.props.currentAddress;
    }

    public get isActive(): boolean | undefined {
        return this.props.isActive;
    }
}

export { Patient };
export type { PatientProps };