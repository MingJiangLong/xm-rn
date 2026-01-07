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
exports.createRiskBuilder = void 0;
const react_native_1 = require("react-native");
const permission_1 = require("../permission");
const NO_DATA = "NO_DATA";
const createRiskBuilder = (sdk, appName, getUUID) => {
    let { getApkListInfo, getContactInfo, getSMSInfo, getPhoneState, getCallLog, getLocationInfo, getCalendarInfo } = sdk;
    return (codes) => __awaiter(void 0, void 0, void 0, function* () {
        let out = [];
        for (let code of codes) {
            let temp = {
                uploadType: code
            };
            try {
                if (code == permission_1.PermissionCode.Application) {
                    if (!getApkListInfo) {
                        console.error(`[${react_native_1.Platform.OS}风控数据]: 缺少应用列表构建函数`);
                        continue;
                    }
                    const str = yield getApkListInfo();
                    temp.jsonPayload = str;
                }
                if (code == permission_1.PermissionCode.Contact) {
                    if (!getContactInfo) {
                        console.error(`[${react_native_1.Platform.OS}风控数据]: 缺少联系人构建函数`);
                        continue;
                    }
                    const str = yield getContactInfo();
                    temp.jsonPayload = str;
                }
                if (code == permission_1.PermissionCode.SMS) {
                    if (!getSMSInfo) {
                        console.error(`[${react_native_1.Platform.OS}风控数据]: 缺少短信构建函数`);
                        continue;
                    }
                    const str = yield getSMSInfo();
                    temp.jsonPayload = str;
                }
                if (code == permission_1.PermissionCode.PhoneState) {
                    if (!getPhoneState) {
                        console.error(`[${react_native_1.Platform.OS}风控数据]: 缺少设备信息构建函数`);
                        continue;
                    }
                    const str = yield getPhoneState();
                    temp.jsonPayload = str;
                }
                if (code == permission_1.PermissionCode.CallLog) {
                    if (!getCallLog) {
                        console.error(`[${react_native_1.Platform.OS}风控数据]: 缺少通话记录构建函数`);
                        continue;
                    }
                    const str = yield getCallLog();
                    temp.jsonPayload = str;
                }
                if (code == permission_1.PermissionCode.Location) {
                    if (!getLocationInfo) {
                        console.error(`[${react_native_1.Platform.OS}风控数据]: 缺少定位信息构建函数`);
                        continue;
                    }
                    const str = yield getLocationInfo();
                    temp.jsonPayload = str;
                }
                if (code == permission_1.PermissionCode.Calendar) {
                    if (!getCalendarInfo) {
                        console.error(`[${react_native_1.Platform.OS}风控数据]: 缺少日历信息构建函数`);
                        continue;
                    }
                    const str = yield getCalendarInfo(appName, getUUID());
                    temp.jsonPayload = str;
                }
                if (temp.jsonPayload == JSON.stringify([]) || temp.jsonPayload == JSON.stringify({})) {
                    temp.isUploaded = NO_DATA;
                }
            }
            catch (error) {
                console.error(`[风控数据]:`, error);
                continue;
            }
        }
        return out;
    });
};
exports.createRiskBuilder = createRiskBuilder;
