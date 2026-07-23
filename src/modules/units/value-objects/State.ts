import { BadRequestError } from '#errors/HttpErrors';

class State {
    private readonly _value: string;

    private static readonly VALID_STATES = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    private constructor(value: string) {
        this._value = value;
    }

    public static create(value: string): State {
        const normalizedValue = value.trim().toUpperCase();

        if (!this.isValidState(normalizedValue)) {
            throw new BadRequestError(`Invalid Brazilian state: ${normalizedValue}`);
        }

        return new State(normalizedValue);
    }

    private static isValidState(value: string): boolean {
        return this.VALID_STATES.includes(value);
    }

    get value(): string {
        return this._value;
    }
}

export { State };