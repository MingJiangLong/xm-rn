

import { Platform } from "react-native";
import { addTimeout } from "../add-timeout";
import { to } from "../to";


export interface I_BasicFirebase {
    getApp(...args: any[]): any
    getMessaging(...args: any[]): any
    getAnalytics(...args: any[]): any
    getAppInstanceId: (...args: any[]) => Promise<string>
    getToken(...args: any[]): Promise<string>
    deleteToken(...args: any[]): Promise<void>
    isDeviceRegisteredForRemoteMessages(...args: any[]): boolean
    registerDeviceForRemoteMessages(...args: any[]): Promise<void>
    requestPermission(...args: any[]): Promise<any>
}



export const useFirebase = <T extends I_BasicFirebase>() => {
    const getFirebaseAppSdk = () => {
        let firebaseApp: any = null;
        if (!firebaseApp) {
            firebaseApp = require("@react-native-firebase/app")
        }
        if (!firebaseApp) throw new Error("@react-native-firebase/app not found");
        return firebaseApp;
    }

    const getFirebaseMessagingSdk = () => {
        let firebaseMessaging: any = null;
        if (!firebaseMessaging) {
            firebaseMessaging = require("@react-native-firebase/messaging")
        }
        if (!firebaseMessaging) throw new Error("@react-native-firebase/messaging not found");
        return firebaseMessaging;
    }

    const getFirebaseAnalyticsSdk = () => {
        let firebaseAnalytics: any = null;
        if (!firebaseAnalytics) {
            firebaseAnalytics = require("@react-native-firebase/analytics")
        }
        if (!firebaseAnalytics) throw new Error("@react-native-firebase/analytics not found");
        return firebaseAnalytics;
    }


    const getMessagingID = addTimeout(
        async () => {
            const firebaseApp = getFirebaseAppSdk();
            const firebaseMessaging = getFirebaseMessagingSdk();
            const { getApp, } = firebaseApp;

            const {
                getMessaging, isDeviceRegisteredForRemoteMessages,
                registerDeviceForRemoteMessages, getToken
            } = firebaseMessaging;
            const app = getApp();
            const messaging = getMessaging(app)
            if (Platform.OS == "ios" && !isDeviceRegisteredForRemoteMessages(messaging)) {
                await registerDeviceForRemoteMessages(messaging);
            }
            const token = await getToken(messaging)
            return token;
        }
    )

    const getFirebaseAnalyticsID = addTimeout(
        async () => {
            const firebaseApp = getFirebaseAppSdk();
            const firebaseAnalytics = getFirebaseAnalyticsSdk();
            const { getApp, } = firebaseApp;
            const { getAnalytics, getAppInstanceId } = firebaseAnalytics;
            const app = getApp();
            const analytics = getAnalytics(app);
            const token = await getAppInstanceId(analytics);
            return token;
        }
    )

    const deleteFirebaseMessagingToken = addTimeout(
        () => {
            const firebaseApp = getFirebaseAppSdk();
            const firebaseMessaging = getFirebaseMessagingSdk();
            const { getApp, } = firebaseApp;
            const {
                getMessaging, deleteToken,
            } = firebaseMessaging;

            const app = getApp();
            const messaging = getMessaging(app);
            return deleteToken(messaging);
        }
    )

    const getFirebaseTokens = async () => {
        let info: Partial<{
            deviceToken: string | null | undefined
            appInstanceId: string | null | undefined
        }> = {}

        let [error, deviceToken] = await to(getMessagingID)()
        if (!error) {
            info = {
                ...info,
                deviceToken
            }
        }
        let [_error2, appInstanceId] = await to(getFirebaseAnalyticsID)()
        if (!_error2) {
            info = {
                ...info,
                appInstanceId
            }
        }
        return info;
    }

    const requestPermission = async () => {
        const firebaseApp = getFirebaseAppSdk();
        const firebaseMessaging = getFirebaseMessagingSdk();

        const { getApp, } = firebaseApp;
        const {
            getMessaging,
            requestPermission
        } = firebaseMessaging;
        const app = getApp();
        const messaging = getMessaging(app)
        const authStatus = await requestPermission(messaging);
        return authStatus as number;
    }


    return {
        getMessagingID,
        getFirebaseAnalyticsID,
        deleteFirebaseMessagingToken,
        getFirebaseTokens,
        requestPermission
    }
}





