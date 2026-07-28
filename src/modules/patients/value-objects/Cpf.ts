import { BadRequestError } from "#shared/errors/HttpErrors";

class Cpf {
    private readonly _value: string;

    private constructor(_value: string) {
        this._value = _value;
    }

    public static create(_value: string): Cpf {
        if (!Cpf.isValid(_value)) {
            throw new BadRequestError('Invalid CPF');
        }
        return new Cpf(_value.replace(/\D/g, ''));
    }

    private static isValid(_value: string): boolean {
        _value = _value.replace(/\D/g, '');
        if (_value.length !== 11 || /^(\d)\1+$/.test(_value)) {
            return false;
        }

        return Cpf.checkDigit(_value, 9) && Cpf.checkDigit(_value, 10);
    }

    private static checkDigit(_value: string, digitPosition: number): boolean {
        let sum = 0;
        let weight = digitPosition + 1;

        for (let i = 0; i < digitPosition; i++) {
            sum += parseInt(_value.charAt(i)) * weight--;
        }

        const remainder = sum % 11;
        const checkDigit = remainder < 2 ? 0 : 11 - remainder;

        return checkDigit === parseInt(_value.charAt(digitPosition));
    }

    get value(): string {
        return this._value;
    }
}

export { Cpf };