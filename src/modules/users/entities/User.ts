import { HashedPassword } from '#modules/users/value-objects/HashedPassword';

type UserProps = {
    id?: string;
    name: string;
    email: string;
    hashedPassword: HashedPassword;
    role: 'admin' | 'user';
    unitId: number;
}

class User {
    private readonly props: UserProps;

    private constructor(props: UserProps) {
        this.props = props;
    }

    public static create(name: string, email: string, hashedPassword: HashedPassword, role: 'admin' | 'user', unitId: number): User {

        const userProps: UserProps = {
            name,
            email,
            hashedPassword,
            role,
            unitId
        };
        return new User(userProps);
    }

    public static reconstitute(props: UserProps): User {
        return new User(props);
    }

    get id(): string | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get email(): string {
        return this.props.email;
    }

    get hashedPassword(): HashedPassword {
        return this.props.hashedPassword;
    }

    get role(): 'admin' | 'user' {
        return this.props.role;
    }

    get unitId(): number {
        return this.props.unitId;
    }
}

export type { UserProps };
export { User };