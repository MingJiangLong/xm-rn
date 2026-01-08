"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrimitive = isPrimitive;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
exports.isSymbol = isSymbol;
exports.isUndefined = isUndefined;
exports.isNull = isNull;
exports.isBigInt = isBigInt;
exports.isNullish = isNullish;
function isPrimitive(value) {
    return typeof value != "object" || value === null;
}
function isString(value) {
    return typeof value === 'string';
}
function isNumber(value) {
    return typeof value === 'number';
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isSymbol(value) {
    return typeof value === 'symbol';
}
function isUndefined(value) {
    return typeof value === 'undefined';
}
function isNull(value) {
    return value === null;
}
function isBigInt(value) {
    return typeof value === 'bigint';
}
function isNullish(value) {
    return value === null || value === undefined;
}
