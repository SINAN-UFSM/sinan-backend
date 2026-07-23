
// 400: Bad Request, The request was invalid parametrers or missing required parameters.
class BadRequestError extends Error {
    private readonly statusCode: number = 400;
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
    }
    get status(): number {
        return this.statusCode;
    }
}

// 401: Unauthorized, The request requires user authentication.
class UnauthorizedError extends Error {
    private readonly statusCode: number = 401;
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
    }
    get status(): number {
        return this.statusCode;
    }
}

// 403: Forbidden, The user does not have permission to access the requested resource.
class ForbiddenError extends Error {
    private readonly statusCode: number = 403;
    constructor(message: string) {
        super(message);
        this.name = 'ForbiddenError';
    }
    get status(): number {
        return this.statusCode;
    }
}

// 404: Not Found, The requested resource could not be found.
class NotFoundError extends Error {
    private readonly statusCode: number = 404;
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
    get status(): number {
        return this.statusCode;
    }
}

// 500: Internal Server Error, An unexpected error occurred on the server.
class InternalServerError extends Error {
    private readonly statusCode: number = 500;
    constructor(message: string) {
        super(message);
        this.name = 'InternalServerError';
    }
    get status(): number {
        return this.statusCode;
    }
}

export {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError
};