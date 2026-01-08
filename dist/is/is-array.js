"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArray = isArray;
function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
}
