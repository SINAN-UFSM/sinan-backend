import { BadRequestError } from "#shared/errors/HttpErrors";

class BirthDate {
    private readonly _value: Date;

    private constructor(_value: Date) {
        this._value = _value;
    }

    public static create(_value: string | Date): BirthDate {
        const parsedDate = BirthDate.parseAndValidate(_value);
        if (!parsedDate) {
            throw new BadRequestError('Invalid birth date');
        }
        return new BirthDate(parsedDate);
    }

    private static parseAndValidate(input: string | Date): Date | null {
        let date: Date;

        if (input instanceof Date) {
            date = input;
        } else if (typeof input === 'string') {
            const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!isoRegex.test(input)) return null;

            const [year, month, day] = input.split('-').map(Number);

            date = new Date(Date.UTC(year, month - 1, day));

            if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
                return null;
            }
        } else {
            return null;
        }

        if (isNaN(date.getTime())) {
            return null;
        }

        const now = new Date();
        const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        if (date > todayUtc) {
            return null;
        }

        const minYear = todayUtc.getUTCFullYear() - 120;
        if (date.getUTCFullYear() < minYear) {
            return null;
        }

        return date;
    }

    get value(): Date {
        return this._value;
    }

    public getFormattedValue(): string {
        return this._value.toISOString().split('T')[0];
    }
}

export { BirthDate };