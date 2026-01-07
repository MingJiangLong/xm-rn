
export const ErrorCode = {
    TIMEOUT_ERROR: "TIMEOUT_ERROR",
    NOT_AUTHENTICATED_ERROR: "NOT_AUTHENTICATED_ERROR",
    FORM_FIELD_ERROR: "FORM_FIELD_ERROR",
}

class BasicError extends Error {
    code: string
    constructor(code: string, message?: string) {
        super(message ?? code)
        this.code = code
        this.name = code
    }
}



/**
 * 超时错误
 */
export class TimeoutError extends BasicError {
    constructor(message?: string) {
        super(ErrorCode.TIMEOUT_ERROR, message)
    }
}

/** 未鉴权错误 */
export class NotAuthenticatedError extends BasicError {
    constructor(message?: string) {
        super(ErrorCode.NOT_AUTHENTICATED_ERROR, message)
    }
}

/** 表单错误 */
export class FormFieldError extends BasicError {
    constructor(message?: string) {
        super(ErrorCode.FORM_FIELD_ERROR, message)
    }
}

export const FeError = {
    FormFieldError,
    TimeoutError,
    NotAuthenticatedError
}

