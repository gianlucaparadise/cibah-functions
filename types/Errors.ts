export class InternalError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = InternalError.name; // stack traces display correctly now 

        this.code = code;
    }
}

export class BadRequestError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = BadRequestError.name; // stack traces display correctly now 

        this.code = code;
    }
}

export class EmptyResponseError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = EmptyResponseError.name; // stack traces display correctly now 

        this.code = code;
    }
}