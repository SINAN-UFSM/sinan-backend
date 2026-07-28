import { BadRequestError } from "#shared/errors/HttpErrors"

class Phone {
    private readonly _value: string
    private constructor(value: string) {
        this._value = value
    }

    public static create(value: string): Phone {
        if (!Phone.isValid(value)) {
            throw new BadRequestError('Invalid phone number')
        }

        const cleanValue = value.replace(/\D/g, '')

        return new Phone(cleanValue)
    }

    private static isValid(value: string): boolean {
        const phoneRegex = /^\(?\d{2}\)?[\s-]?[\s9]?\d{4}-?\d{4}$/
        return phoneRegex.test(value)
    }

    get value(): string {
        return this._value
    }

    public getFormattedValue(): string {
        const ddd = this._value.slice(0, 2)
        const isMobile = this._value.length === 11

        if (isMobile) {
            const part1 = this._value.slice(2, 7)
            const part2 = this._value.slice(7)
            return `(${ddd}) ${part1}-${part2}`
        } else {
            const part1 = this._value.slice(2, 6)
            const part2 = this._value.slice(6)
            return `(${ddd}) ${part1}-${part2}`
        }
    }
}

export { Phone }