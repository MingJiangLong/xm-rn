"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Format = void 0;
const to_fixed_1 = require("./to-fixed");
const to_locale_string_1 = require("./to-locale-string");
exports.Format = {
    toFixed: to_fixed_1.toFixed,
    toLocaleString: to_locale_string_1.toLocaleString
};
