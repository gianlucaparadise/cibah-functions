class BaseResponse<T> {
    readonly error: ErrorBody;
    readonly data: T;

    constructor(data: T, error: ErrorBody) {
        this.data = data;
        this.error = error;
    }
}

class ErrorBody {
    readonly code: String;
    readonly message: String;

    constructor(code: String, message: String) {
        this.code = code;
        this.message = message;
    }
}

export class ErrorResponse extends BaseResponse<Object> {

    constructor(errorCode: String, errorMessage: String) {
        const error = new ErrorBody(errorCode, errorMessage);
        super(null, error);
    }
}

export class MyResponse<T> extends BaseResponse<T> {

    constructor(data: T) {
        super(data, null);
    }
}