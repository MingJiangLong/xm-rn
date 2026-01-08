"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeError = exports.DependencyMissingError = exports.FormFieldError = exports.NotAuthenticatedError = exports.TimeoutError = exports.ErrorCode = void 0;
exports.ErrorCode = {
    TIMEOUT_ERROR: "TIMEOUT_ERROR",
    NOT_AUTHENTICATED_ERROR: "NOT_AUTHENTICATED_ERROR",
    FORM_FIELD_ERROR: "FORM_FIELD_ERROR",
    DEPENDENCY_MISSING_ERROR: "DEPENDENCY_MISSING_ERROR",
};
class BasicError extends Error {
    constructor(code, message) {
        super(message !== null && message !== void 0 ? message : code);
        this.code = code;
        this.name = code;
    }
}
/**
 * 超时错误
 */
class TimeoutError extends BasicError {
    constructor(message) {
        super(exports.ErrorCode.TIMEOUT_ERROR, message);
    }
}
exports.TimeoutError = TimeoutError;
/** 未鉴权错误 */
class NotAuthenticatedError extends BasicError {
    constructor(message) {
        super(exports.ErrorCode.NOT_AUTHENTICATED_ERROR, message);
    }
}
exports.NotAuthenticatedError = NotAuthenticatedError;
/** 表单错误 */
class FormFieldError extends BasicError {
    constructor(message) {
        super(exports.ErrorCode.FORM_FIELD_ERROR, message);
    }
}
exports.FormFieldError = FormFieldError;
class DependencyMissingError extends BasicError {
    constructor(message) {
        super(exports.ErrorCode.DEPENDENCY_MISSING_ERROR, message);
    }
}
exports.DependencyMissingError = DependencyMissingError;
exports.FeError = {
    FormFieldError,
    TimeoutError,
    NotAuthenticatedError,
    DependencyMissingError
};
