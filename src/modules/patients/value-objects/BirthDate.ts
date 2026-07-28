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
            date = new Date(year, month - 1, day);

            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                return null;
            }
        } else {
            return null;
        }

        if (isNaN(date.getTime())) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date > today) {
            return null;
        }

        const minYear = today.getFullYear() - 120;
        if (date.getFullYear() < minYear) {
            return null;
        }

        return date;
    }
    get value(): Date {
        return this._value;
    }

    public getFormatted_value(): string {
        return this._value.toISOString().split('T')[0];
    }
}

export { BirthDate };