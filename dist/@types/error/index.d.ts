export declare const ErrorCode: {
    TIMEOUT_ERROR: string;
    NOT_AUTHENTICATED_ERROR: string;
    FORM_FIELD_ERROR: string;
    DEPENDENCY_MISSING_ERROR: string;
};
declare class BasicError extends Error {
    code: string;
    constructor(code: string, message?: string);
}
/**
 * 超时错误
 */
export declare class TimeoutError extends BasicError {
    constructor(message?: string);
}
/** 未鉴权错误 */
export declare class NotAuthenticatedError extends BasicError {
    constructor(message?: string);
}
/** 表单错误 */
export declare class FormFieldError extends BasicError {
    constructor(message?: string);
}
export declare class DependencyMissingError extends BasicError {
    constructor(message?: string);
}
export declare const FeError: {
    FormFieldError: typeof FormFieldError;
    TimeoutError: typeof TimeoutError;
    NotAuthenticatedError: typeof NotAuthenticatedError;
    DependencyMissingError: typeof DependencyMissingError;
};
export {};
