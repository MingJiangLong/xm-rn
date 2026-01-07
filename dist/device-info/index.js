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
const react_native_1 = require("react-native");
const add_timeout_1 = require("../add-timeout");
const to_fixed_1 = require("../format/to-fixed");
const useDeviceModule = (DeviceInfo) => {
    const fetchIpAddress = (0, add_timeout_1.addTimeout)(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let resp = yield fetch("https://icanhazip.com/");
                return (yield (resp === null || resp === void 0 ? void 0 : resp.text())).trim();
            }
            catch (e) {
                return DeviceInfo.getIpAddress();
            }
        });
    });
    function buildIOSDeviceInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const batteryCharging = yield DeviceInfo.isBatteryCharging();
            let chargingStatus = 3;
            if (batteryCharging) {
                chargingStatus = 2;
            }
            const result = {
                appChannel: react_native_1.Platform.OS,
                model: DeviceInfo.getDeviceId(),
                manufacturer: 'apple',
                systemVersion: DeviceInfo.getSystemVersion(),
                batteryPercentage: (0, to_fixed_1.toFixed)(yield DeviceInfo.getBatteryLevel()),
                appName: DeviceInfo.getApplicationName(),
                appPackage: DeviceInfo.getBundleId(),
                appVersionName: DeviceInfo.getVersion(),
                chargingStatus: chargingStatus, //充电状态 充电状态2:充电中;3:未充电;  5:已满电;1:其他未知状态
                rooted: yield DeviceInfo.check(), //是否越狱
                publicIpAddress: yield fetchIpAddress(), //
                deviceNo: yield DeviceInfo.getUniqueId(),
                deviceName: yield DeviceInfo.getDeviceName(),
            };
            return JSON.stringify(result);
        });
    }
    const buildDefaultPostData = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const phoneName = react_native_1.Platform.select({
            android: `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()}`,
            ios: yield DeviceInfo.getDeviceName()
        });
        const version = react_native_1.Platform.select({
            android: `android ${DeviceInfo.getSystemVersion()}`,
            ios: `iOS ${DeviceInfo.getSystemVersion()}`
        });
        const deviceID = react_native_1.Platform.select({
            ios: yield DeviceInfo.syncUniqueId(),
            android: yield DeviceInfo.getAndroidId()
        });
        const temp = {
            reqSource: (_a = react_native_1.Platform.select({
                ios: 'Ios',
                android: 'Android'
            })) !== null && _a !== void 0 ? _a : "Android",
            phoneName,
            appVersion: DeviceInfo.getVersion(),
            androidversion: version,
            deviceID,
        };
        return Promise.resolve(temp);
    });
    const buildWebviewEnv = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const iosName = yield DeviceInfo.getDeviceName();
        const androidName = `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()}`;
        const phoneName = (_a = react_native_1.Platform.select({
            ios: iosName,
            android: androidName
        })) !== null && _a !== void 0 ? _a : "";
        const deviceId = (_b = react_native_1.Platform.select({
            android: yield DeviceInfo.getAndroidId(),
            ios: yield DeviceInfo.getUniqueId()
        })) !== null && _b !== void 0 ? _b : "";
        const androidVersion = `android ${DeviceInfo.getSystemVersion()}`;
        const iosVersion = `iOS${DeviceInfo.getSystemVersion()}`;
        const version = (_c = react_native_1.Platform.select({
            android: androidVersion,
            ios: iosVersion
        })) !== null && _c !== void 0 ? _c : "";
        return {
            appName: DeviceInfo.getApplicationName(),
            appPackageName: DeviceInfo.getBundleId(),
            appVersion: DeviceInfo.getVersion(),
            platform: (_d = react_native_1.Platform.select({
                ios: 'Ios',
                android: 'Android'
            })) !== null && _d !== void 0 ? _d : "Android",
            deviceId,
            phoneName: phoneName,
            androidVersion: version,
            appType: "rn",
        };
    });
    return {
        buildIOSDeviceInfo,
        buildDefaultPostData,
        buildWebviewEnv
    };
};
