

import { Platform } from "react-native";
import { addTimeout } from "../add-timeout";
import { to } from "../to";


export interface I_BasicFirebase {
    getApp(...args: any[]): any

    deleteToken(...args: any[]): Promise<void>
    getMessaging(...args: any[]): any
    isDeviceRegisteredForRemoteMessages(...args: any[]): boolean
    registerDeviceForRemoteMessages(...args: any[]): Promise<void>

    getAnalytics(...args: any[]): any
    requestPermission(...args: any[]): Promise<any>

}



export const useFirebase = <T extends I_BasicFirebase>(module: T) => {


    const {
        getApp,
        getMessaging, isDeviceRegisteredForRemoteMessages, registerDeviceForRemoteMessages, deleteToken,
        getAnalytics
    } = module;

    const getMessagingID = addTimeout(
        async () => {
            const app = getApp();
            const messaging = getMessaging(app)
            if (Platform.OS == "ios" && !isDeviceRegisteredForRemoteMessages(messaging)) {
                await registerDeviceForRemoteMessages(messaging);
            }
            const token = await messaging.getToken()
            return token;
        }
    )

    const getFirebaseAnalyticsID = addTimeout(
        async () => {
            const app = getApp();
            const analytics = getAnalytics(app);
            const token = await analytics.getAppInstanceId()
            return token;
        }
    )

    const deleteFirebaseMessagingToken = addTimeout(
        () => {
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


    return {
        getMessagingID,
        getFirebaseAnalyticsID,
        deleteFirebaseMessagingToken,
        getFirebaseTokens
    }

}





