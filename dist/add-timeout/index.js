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
exports.addTimeout = addTimeout;
const error_1 = require("../error");
function addTimeout(input, timeout = 3000, timeoutMessage) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        let timeoutId = undefined;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new error_1.TimeoutError(timeoutMessage)), timeout);
        });
        const operationPromise = input(...args);
        const racePromise = Promise.race([operationPromise, timeoutPromise]);
        try {
            const result = yield Promise.race([racePromise, operationPromise]);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            return result;
        }
        catch (error) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            throw error;
        }
    });
}
