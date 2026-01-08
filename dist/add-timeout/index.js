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
const log_1 = require("../terminal-log/log");
const terminalLog = new log_1.TerminalLog("[add-timeout] ");
/**
 * 给函数添加超时
 * @param input 需要添加的函数 有日志输入不要使用匿名函数
 * @param timeout  超时时间 默认3秒
 * @param timeoutMessage 超时消息
 * @returns
 */
function addTimeout(input, timeout = 3000, timeoutMessage) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        let timeoutId = undefined;
        const racePromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new error_1.TimeoutError(timeoutMessage)), timeout);
        });
        const operationPromise = input(...args);
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
            if (error instanceof error_1.TimeoutError) {
                terminalLog.warn(`函数${input.name}执行超时`);
            }
            throw error;
        }
    });
}
