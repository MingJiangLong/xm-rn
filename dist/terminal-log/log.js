"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalLog = void 0;
const global_value_1 = require("../global/global-value");
function info(message, ...optionalParams) {
    console.log(message, ...optionalParams);
}
function warn(message, ...optionalParams) {
    console.warn(message, ...optionalParams);
}
function error(message, ...optionalParams) {
    console.error(message, ...optionalParams);
}
class TerminalLog {
    constructor(prefix) {
        this.prefix = prefix;
    }
    info(message, ...optionalParams) {
        if (!global_value_1.globalValue.isDev)
            return;
        console.log(this.prefix, message, ...optionalParams);
    }
    warn(message, ...optionalParams) {
        if (!global_value_1.globalValue.isDev)
            return;
        console.warn(this.prefix, message, ...optionalParams);
    }
    error(message, ...optionalParams) {
        if (!global_value_1.globalValue.isDev)
            return;
        console.error(this.prefix, message, ...optionalParams);
    }
}
exports.TerminalLog = TerminalLog;
