"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlainObject = isPlainObject;
function isPlainObject(value) {
    return (typeof value === 'object' &&
        value !== null &&
        Object.prototype.toString.call(value) === '[object Object]' &&
        value.constructor === Object);
}
