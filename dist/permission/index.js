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
exports.requestPermissionStatusManager = exports.usePermission = exports.PermissionCode = void 0;
const react_native_1 = require("react-native");
const IGNORED_PERMISSION = "ignored_permission";
var PermissionCode;
(function (PermissionCode) {
    PermissionCode["Camera"] = "0";
    PermissionCode["Application"] = "1";
    PermissionCode["Contact"] = "2";
    PermissionCode["SMS"] = "4";
    PermissionCode["Location"] = "5";
    PermissionCode["PhoneState"] = "6";
    PermissionCode["CallLog"] = "7";
    PermissionCode["Calendar"] = "12";
    PermissionCode["Microphone"] = "13";
    PermissionCode["FirebaseMessaging"] = "-1";
    PermissionCode["UserTracking"] = "-2";
    PermissionCode["Photo"] = "10";
    PermissionCode["Finger"] = "3";
    PermissionCode["PersonalInfo"] = "9";
    PermissionCode["Wifi"] = "11";
})(PermissionCode || (exports.PermissionCode = PermissionCode = {}));
const usePermission = (permissionModule, firebaseModule) => {
    const { PERMISSIONS, RESULTS, request, requestMultiple } = permissionModule;
    let PermissionsInfo = {
        [PermissionCode.Camera]: react_native_1.Platform.select({
            android: PERMISSIONS.ANDROID.CAMERA,
            ios: PERMISSIONS.IOS.CAMERA
        }),
        [PermissionCode.Application]: undefined,
        [PermissionCode.Contact]: react_native_1.Platform.select({
            android: undefined,
            ios: PERMISSIONS.IOS.CONTACTS
        }),
        [PermissionCode.SMS]: react_native_1.Platform.select({
            android: PERMISSIONS.ANDROID.READ_SMS,
            ios: undefined
        }),
        [PermissionCode.Location]: react_native_1.Platform.select({
            android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
            ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        }),
        [PermissionCode.PhoneState]: undefined,
        [PermissionCode.CallLog]: react_native_1.Platform.select({
            ios: undefined,
            android: PERMISSIONS.ANDROID.READ_CALL_LOG
        }),
        [PermissionCode.Calendar]: react_native_1.Platform.select({
            ios: PERMISSIONS.IOS.CALENDARS,
            android: PERMISSIONS.ANDROID.READ_CALENDAR
        }),
        [PermissionCode.Microphone]: react_native_1.Platform.select({
            ios: PERMISSIONS.ANDROID.RECORD_AUDIO,
            android: PERMISSIONS.IOS.MICROPHONE
        }),
        [PermissionCode.UserTracking]: react_native_1.Platform.select({
            ios: PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY,
            android: undefined
        }),
        [PermissionCode.Photo]: react_native_1.Platform.select({
            ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
            android: undefined
        }),
        [PermissionCode.FirebaseMessaging]: undefined,
        [PermissionCode.Finger]: undefined,
        [PermissionCode.PersonalInfo]: undefined,
        [PermissionCode.Wifi]: undefined,
    };
    const requestFirebaseMessagingPermission = () => __awaiter(void 0, void 0, void 0, function* () {
        if (react_native_1.Platform.OS === "ios") {
            const app = firebaseModule.getApp();
            const messaging = firebaseModule.getMessaging(app);
            const authStatus = yield firebaseModule.requestPermission(messaging);
            if (authStatus === 1 ||
                authStatus === 2) {
                return RESULTS.GRANTED;
            }
            return RESULTS.DENIED;
        }
        if (react_native_1.Platform.OS === "android" && react_native_1.Platform.Version >= 33) {
            const result = yield react_native_1.PermissionsAndroid.request(react_native_1.PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            return result != RESULTS.GRANTED ? RESULTS.DENIED : RESULTS.GRANTED;
        }
        if (react_native_1.Platform.OS === "android") {
            return Promise.resolve(RESULTS.GRANTED);
        }
        return Promise.resolve(RESULTS.UNAVAILABLE);
    });
    const requestPermission = (permissionCode) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            exports.requestPermissionStatusManager.update("requesting");
            const requestCode = PermissionsInfo[permissionCode];
            if (!requestCode)
                return IGNORED_PERMISSION;
            if (permissionCode == PermissionCode.FirebaseMessaging) {
                return requestFirebaseMessagingPermission();
            }
            const result = yield request(requestCode);
            if (permissionCode == PermissionCode.Contact) {
                if (result == RESULTS.GRANTED || result == RESULTS.LIMITED)
                    return RESULTS.GRANTED;
            }
            return result;
        }
        finally {
            exports.requestPermissionStatusManager.update("idle");
        }
    });
    const requestMultiplePermissions = (permissions) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            exports.requestPermissionStatusManager.update("requesting");
            const multiplePermissionStr = permissions
                .filter(permission => permission != PermissionCode.FirebaseMessaging)
                .map(permissionCode => PermissionsInfo[permissionCode]).filter(Boolean);
            let firebaseResult;
            if (permissions.includes(PermissionCode.FirebaseMessaging)) {
                firebaseResult = yield requestFirebaseMessagingPermission();
            }
            const requestResultMap = yield requestMultiple(multiplePermissionStr);
            return permissions.reduce((pre, permission) => {
                const permissionStr = PermissionsInfo[permission];
                if (permissionStr == undefined)
                    return [
                        ...pre,
                        {
                            serviceCode: permission,
                            status: IGNORED_PERMISSION
                        }
                    ];
                if (permission == PermissionCode.FirebaseMessaging) {
                    return [
                        ...pre,
                        {
                            serviceCode: permission,
                            status: firebaseResult
                        }
                    ];
                }
                const requestResultStatus = requestResultMap[permissionStr];
                if (permission == PermissionCode.Contact) {
                    return [
                        ...pre,
                        {
                            serviceCode: permission,
                            status: (requestResultStatus == RESULTS.GRANTED || requestResultStatus == RESULTS.LIMITED) ? RESULTS.GRANTED : requestResultStatus
                        }
                    ];
                }
                return [...pre, {
                        serviceCode: permission,
                        status: requestResultStatus
                    }];
            }, []);
        }
        finally {
            exports.requestPermissionStatusManager.update("idle");
        }
    });
    const updatePermissionsInfoMap = (permissionsInfo) => {
        PermissionsInfo = Object.assign(Object.assign({}, PermissionsInfo), permissionsInfo);
    };
    return {
        requestPermission,
        requestMultiplePermissions,
        updatePermissionsInfoMap
    };
};
exports.usePermission = usePermission;
class RequestPermissionStatusManager {
    constructor() {
        this.__status__ = "idle";
    }
    get status() {
        return this.__status__;
    }
    update(nextStatus) {
        this.__status__ = nextStatus;
    }
}
exports.requestPermissionStatusManager = new RequestPermissionStatusManager();
