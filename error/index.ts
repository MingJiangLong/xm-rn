
export const ErrorCode = {
    TIMEOUT_ERROR: "TIMEOUT_ERROR",
    NOT_AUTHENTICATED_ERROR: "NOT_AUTHENTICATED_ERROR",
    FORM_FIELD_ERROR: "FORM_FIELD_ERROR",
    DEPENDENCY_MISSING_ERROR: "DEPENDENCY_MISSING_ERROR",
}


export class TimeoutError extends Error {
    constructor(message?: string) {
        super(message ?? "timeout!, please try again later.");
        this.name = "TimeoutError";
    }
}


export class LockBusyError extends Error {
    constructor(message?: string) {
        super(message ?? "Operation in progress, please try again later.");
        this.name = "LockBusyError";
    }
}

export const FeError = {
    TimeoutError,
    LockBusyError
}

