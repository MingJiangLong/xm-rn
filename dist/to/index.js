"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.to = to;
exports.toSync = toSync;
/**
 *
 * @param fn
 *
 * @example
 *
 * async function test(){
 *    const [error,data] = await to(async() => {})()
 * }
 * @returns
 */
function to(fn) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fn(...args);
            return [null, data];
        }
        catch (error) {
            return [error, null];
        }
    });
}
/** 要注意有些函数返回了null */
function toSync(fn) {
    return (...args) => {
        try {
            const data = fn(...args);
            return [null, data];
        }
        catch (error) {
            return [error, null];
        }
    };
}
