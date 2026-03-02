

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


    let firebaseApp: any = null;
    let firebaseMessaging: any = null;
    let firebaseAnalytics: any = null;


    const checkAndInitialFirebaseApp = () => {
        if (!firebaseApp) {
            firebaseApp = require("@react-native-firebase/app")
        }
        if (!firebaseApp) throw new Error("@react-native-firebase/app not found");
    }

    const checkAndInitialFirebaseMessaging = () => {
        if (!firebaseMessaging) {
            firebaseMessaging = require("@react-native-firebase/messaging")
        }
        if (!firebaseMessaging) throw new Error("@react-native-firebase/messaging not found");
    }

    const checkAndInitialFirebaseAnalytics = () => {
        if (!firebaseAnalytics) {
            firebaseAnalytics = require("@react-native-firebase/analytics")
        }
        if (!firebaseMessaging) throw new Error("@react-native-firebase/messaging not found");
    }


    const getMessagingID = addTimeout(
        async () => {
            checkAndInitialFirebaseApp()
            const { getApp, } = firebaseApp;

            checkAndInitialFirebaseMessaging();
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
            checkAndInitialFirebaseApp()
            const { getApp, } = firebaseApp;
            const app = getApp();
            checkAndInitialFirebaseAnalytics()
            const { getAnalytics, getAppInstanceId } = firebaseAnalytics;
            const analytics = getAnalytics(app);
            const token = await getAppInstanceId(analytics);
            return token;
        }
    )

    const deleteFirebaseMessagingToken = addTimeout(
        () => {
            checkAndInitialFirebaseApp()
            const { getApp, } = firebaseApp;
            const app = getApp();

            checkAndInitialFirebaseMessaging();
            const {
                getMessaging, deleteToken,
            } = firebaseMessaging;

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


    return {
        getMessagingID,
        getFirebaseAnalyticsID,
        deleteFirebaseMessagingToken,
        getFirebaseTokens
    }
}





