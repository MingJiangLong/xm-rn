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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiInfo = void 0;
exports.createApis = createApis;
exports.createPostFactory = createPostFactory;
const add_timeout_1 = require("../add-timeout");
const error_1 = require("../error");
/**
 * 增强fetch
 * 1. 添加超时功能
 * @param input
 * @param init
 * @returns
 */
function fetchEnhanced(input, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { timeout = 3000 } = options, init = __rest(options, ["timeout"]);
        return (0, add_timeout_1.addTimeout)(fetch, timeout)(input, init);
    });
}
class ApiInfo {
    constructor(path, desc) {
        this.path = path;
        this.desc = desc;
    }
}
exports.ApiInfo = ApiInfo;
function createApis(apis, desc) {
    return Object.keys(apis).reduce((total, pathKey) => {
        var _a;
        const path = apis[pathKey];
        const apiDesc = (_a = desc === null || desc === void 0 ? void 0 : desc[pathKey]) !== null && _a !== void 0 ? _a : apis[pathKey];
        return Object.assign(Object.assign({}, total), { [pathKey]: new ApiInfo(path, apiDesc) });
    }, {});
}
const buildEmptyObject = () => Promise.resolve({});
function createPostFactory(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { host, timeout, buildRequestDataFn = buildEmptyObject, buildHeaderFn = buildEmptyObject, showLog = false } = options;
        const requestDataWhenCreateFactory = yield buildRequestDataFn();
        const headerWhenCreateFactory = yield buildHeaderFn();
        return function (urlInfo, data, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const isShowLog = showLog;
                let url = "";
                let api;
                if (typeof urlInfo === "string") {
                    api = new ApiInfo(urlInfo, "unknown api");
                }
                else {
                    api = urlInfo;
                }
                url = `${host}${api.path.startsWith("/") ? "" : "/"}${api.path}`;
                if (isShowLog) {
                    console.log(`[${api.desc}] 请求地址:`, url);
                }
                const tempRequestData2 = (options === null || options === void 0 ? void 0 : options.buildRequestDataFn) ? yield options.buildRequestDataFn() : {};
                const tempRequestHeader2 = (options === null || options === void 0 ? void 0 : options.buildHeaderFn) ? yield options.buildHeaderFn() : {};
                const requestData = Object.assign(Object.assign(Object.assign({}, requestDataWhenCreateFactory), tempRequestData2), data);
                if (isShowLog) {
                    console.log(`[${api.desc}] 请求参数:`, JSON.stringify(requestData, null, 2));
                }
                const requestHeader = Object.assign(Object.assign({}, headerWhenCreateFactory), tempRequestHeader2);
                try {
                    const response = yield fetchEnhanced(url, {
                        body: JSON.stringify(requestData),
                        headers: requestHeader,
                        method: "POST"
                    });
                    const responseDataTemp = yield response.text();
                    let responseData = responseDataTemp;
                    if (options === null || options === void 0 ? void 0 : options.responseInterceptor) {
                        responseData = yield options.responseInterceptor(responseData);
                    }
                    try {
                        const temp = JSON.parse(responseData);
                        if (isShowLog) {
                            console.log(`[${api.desc}] 返回参数:`, JSON.stringify(temp, null, 2));
                        }
                        if ((temp === null || temp === void 0 ? void 0 : temp.code) == "-1") {
                            throw new error_1.NotAuthenticatedError();
                        }
                        return temp;
                    }
                    catch (error) {
                        if (isShowLog) {
                            console.log(`[${api.desc}] 返回参数:`, "已收到返回内容可能过长截取前20位", responseData.slice(0, 20));
                        }
                        return responseData;
                    }
                }
                catch (error) {
                    if (isShowLog) {
                        console.log(`[${api.desc}] 请求失败:`, JSON.stringify(error));
                    }
                    throw error;
                }
            });
        };
    });
}
