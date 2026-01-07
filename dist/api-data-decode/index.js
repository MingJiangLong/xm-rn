"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDataFormat = exports.decryptApiResponse = void 0;
exports.createApiResponseParseBuilder = createApiResponseParseBuilder;
exports.replaceKeyInObjectAndArray = replaceKeyInObjectAndArray;
const crypto_js_1 = __importDefault(require("crypto-js"));
function getKey(key) {
    return crypto_js_1.default.enc.Utf8.parse(key);
}
const decryptApiResponse = (word, key) => {
    let base64 = crypto_js_1.default.enc.Base64.parse(word.replace(/\s/g, ''));
    let src = crypto_js_1.default.enc.Base64.stringify(base64);
    let decrypt = crypto_js_1.default.AES.decrypt(src, getKey(key), {
        mode: crypto_js_1.default.mode.ECB,
        padding: crypto_js_1.default.pad.Pkcs7,
    });
    let decryptedStr = decrypt.toString(crypto_js_1.default.enc.Utf8);
    return JSON.parse(decryptedStr);
};
exports.decryptApiResponse = decryptApiResponse;
function recordMap(items) {
    return Object.entries(items).reduce((total, current) => {
        const [key, value] = current;
        if (typeof value == "string") {
            return Object.assign(Object.assign({}, total), { [value]: key });
        }
        return Object.assign(Object.assign({}, total), recordMap(value));
    }, {});
}
/**
 *
 * @param value
 * @description
 * const parse = createApiResponseParseBuilder({"/a/b":{response:{code:"a",data:{a:"b"}}}})
 *
 * const data = parse(responseData,"/a/b")
 *
 * @returns
 */
function createApiResponseParseBuilder(json) {
    const pathKeys = Object.keys(json).filter(item => item.includes("/"));
    const cache = pathKeys.reduce((total, current) => {
        var _a;
        const currentMap = (_a = json[current]) === null || _a === void 0 ? void 0 : _a.response;
        return Object.assign(Object.assign({}, total), { [current]: recordMap(currentMap) });
    }, {});
    return (key, root) => {
        var _a;
        const findKey = Object.keys(cache).find(item => root.endsWith(item));
        if (!findKey)
            return key;
        const map = cache[findKey];
        return (_a = map[key]) !== null && _a !== void 0 ? _a : key;
    };
}
function isKV(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
}
/**
 * 替换value中可替换的键值对的键
 * @param value
 * @param callback
 * @returns
 */
function replaceKeyInObjectAndArray(value, callback) {
    if (!isKV(value) && !isArray(value))
        return value;
    if (isArray(value))
        return value.map(item => replaceKeyInObjectAndArray(item, callback));
    return Object.keys(value).reduce((total, key) => {
        return Object.assign(Object.assign({}, total), { [callback(key)]: replaceKeyInObjectAndArray(value[key], callback) });
    }, {});
}
exports.ApiDataFormat = {
    decryptApiResponse: exports.decryptApiResponse,
    replaceKeyInObjectAndArray,
    createApiResponseParseBuilder
};
