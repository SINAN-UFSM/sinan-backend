import { BadRequestError } from "#shared/errors/HttpErrors";

class SusCard {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value;
    }

    public static create(value: string): SusCard {
        if (!SusCard.isValid(value)) {
            throw new BadRequestError('Invalid SUS Card');
        }
        return new SusCard(value.replace(/\D/g, ''));
    }

    private static isValid(value: string): boolean {
        value = value.replace(/\D/g, '');

        if (value.length !== 15 || /^(\d)\1+$/.test(value)) {
            return false;
        }

        const firstDigit = value.charAt(0);

        if (['1', '2'].includes(firstDigit)) {
            return SusCard.validateDefinitive(value);
        }

        if (['7', '8', '9'].includes(firstDigit)) {
            return SusCard.validateProvisional(value);
        }

        return false;
    }

    private static validateDefinitive(value: string): boolean {
        const pis = value.substring(0, 11);
        let sum = 0;
        let weight = 15;

        for (let i = 0; i < 11; i++) {
            sum += parseInt(pis.charAt(i)) * weight--;
        }

        let remainder = sum % 11;
        let dv = 11 - remainder;

        if (dv === 11) {
            dv = 0;
        }

        let resultado: string;

        if (dv === 10) {
            sum += 2;
            remainder = sum % 11;
            dv = 11 - remainder;
            resultado = pis + "001" + dv;
        } else {
            resultado = pis + "000" + dv;
        }

        return value === resultado;
    }

    private static validateProvisional(value: string): boolean {
        let sum = 0;
        let weight = 15;

        for (let i = 0; i < 15; i++) {
            sum += parseInt(value.charAt(i)) * weight--;
        }

        return sum % 11 === 0;
    }

    get value(): string {
        return this._value;
    }
}

export { SusCard };