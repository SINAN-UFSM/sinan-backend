import { State } from '#modules/units/value-objects/State';

type UnitProps = {
    id?: number;
    name: string;
    city: string;
    state: State;
    isActive?: boolean;
}

class Unit {
    private readonly props: UnitProps;

    private constructor(props: UnitProps) {
        this.props = {
            ...props,
            isActive: props.isActive ?? true,
        };
    }

    public static create(props: UnitProps): Unit {
        return new Unit(props);
    }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get city(): string {
        return this.props.city;
    }

    get state(): State {
        return this.props.state;
    }

    get isActive(): boolean {
        return this.props.isActive ?? true;
    }
}

export type { UnitProps };
export { Unit };