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
const to_1 = require("../to");
const useFirebase = (module) => {
    const { getApp, getMessaging, isDeviceRegisteredForRemoteMessages, registerDeviceForRemoteMessages, deleteToken, getAnalytics } = module;
    const getMessagingID = (0, add_timeout_1.addTimeout)(() => __awaiter(void 0, void 0, void 0, function* () {
        const app = getApp();
        const messaging = getMessaging(app);
        if (react_native_1.Platform.OS == "ios" && !isDeviceRegisteredForRemoteMessages(messaging)) {
            yield registerDeviceForRemoteMessages(messaging);
        }
        const token = yield messaging.getToken();
        return token;
    }));
    const getFirebaseAnalyticsID = (0, add_timeout_1.addTimeout)(() => __awaiter(void 0, void 0, void 0, function* () {
        const app = getApp();
        const analytics = getAnalytics(app);
        const token = yield analytics.getAppInstanceId();
        return token;
    }));
    const deleteFirebaseMessagingToken = (0, add_timeout_1.addTimeout)(() => {
        const app = getApp();
        const messaging = getMessaging(app);
        return deleteToken(messaging);
    });
    const getFirebaseTokens = () => __awaiter(void 0, void 0, void 0, function* () {
        let info = {};
        let [error, deviceToken] = yield (0, to_1.to)(getMessagingID)();
        if (!error) {
            info = Object.assign(Object.assign({}, info), { deviceToken });
        }
        let [_error2, appInstanceId] = yield (0, to_1.to)(getFirebaseAnalyticsID)();
        if (!_error2) {
            info = Object.assign(Object.assign({}, info), { appInstanceId });
        }
        return info;
    });
    return {
        getMessagingID,
        getFirebaseAnalyticsID,
        deleteFirebaseMessagingToken,
        getFirebaseTokens
    };
};
