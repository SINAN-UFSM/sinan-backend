import { Password } from '#modules/users/value-objects/Password';
import type { Email } from '#modules/users/value-objects/Email';

type UserProps = {
    publicId?: string;
    name: string;
    email: Email;
    hashedPassword: Password;
    role: 'admin' | 'user';
    unitId: string;
}

class User {
    private readonly props: UserProps;
    private constructor(props: UserProps) {
        this.props = props;
    }

    public static create(name: string, email: Email, hashedPassword: Password, role: 'admin' | 'user', unitId: string): User {

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

    get publicId(): string | undefined {
        return this.props.publicId;
    }

    get name(): string {
        return this.props.name;
    }

    get email(): Email {
        return this.props.email;
    }

    get hashedPassword(): Password {
        return this.props.hashedPassword;
    }

    get role(): 'admin' | 'user' {
        return this.props.role;
    }

    get unitId(): string {
        return this.props.unitId;
    }
}

export type { UserProps };
export { User };