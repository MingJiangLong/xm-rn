"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _GlobalValue_isDev;
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalValue = void 0;
class GlobalValue {
    constructor() {
        _GlobalValue_isDev.set(this, false);
    }
    get isDev() {
        return __classPrivateFieldGet(this, _GlobalValue_isDev, "f");
    }
    setIsDev(value) {
        __classPrivateFieldSet(this, _GlobalValue_isDev, value, "f");
    }
}
_GlobalValue_isDev = new WeakMap();
exports.globalValue = new GlobalValue();
