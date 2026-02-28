import { PermissionsAndroid, Platform } from "react-native";

type XM_PermissionStatus = "unavailable" | "blocked" | "denied" | "granted" | "limited" | "ignored_permission"

export enum PermissionCode {
    Camera = "0",
    Application = "1",
    Contact = "2",
    SMS = "4",
    Location = "5",
    PhoneState = "6",
    CallLog = "7",
    Calendar = "12",
    Microphone = "13",
    FirebaseMessaging = "-1",
    UserTracking = "-2",
    Photo = "10",
    Finger = "3",
    PersonalInfo = "9",
    Wifi = "11",
}
type Result = "unavailable" | "blocked" | "denied" | "granted" | "limited"
export const usePermission = (
    interceptor?: (permissionCode: PermissionCode, process: number) => Promise<Result>
) => {


    let permissionSdk: any = undefined;
    let firebaseApp: any = undefined
    let firebaseMessaging: any = undefined;
    let calendarSdk: any = undefined



    const requestPermission = async (permissionCode: PermissionCode): Promise<Result> => {
        try {
            if (permissionSdk == undefined) {
                permissionSdk = require("react-native-permissions")
            }
            if (!permissionSdk) throw new Error("react-native-permissions not found");
            const { PERMISSIONS, RESULTS, request } = permissionSdk;
            requestPermissionStatusManager.update("requesting")
            // 风控数据相关权限
            if (permissionCode == PermissionCode.Contact) {
                if (Platform.OS === "ios") return request(PERMISSIONS.IOS.CONTACTS);
            }
            if (permissionCode == PermissionCode.SMS) {
                if (Platform.OS === "android") return request(PERMISSIONS.ANDROID.READ_SMS)
            }
            if (permissionCode == PermissionCode.Location) {
                return request(Platform.select({
                    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                }))
            }
            if (permissionCode == PermissionCode.Calendar) {
                calendarSdk = require("react-native-calendar-events")
                if (!calendarSdk) throw new Error("react-native-calendar-events not found");
                const result = await calendarSdk.requestPermissions();
                if (result != "authorized") return PERMISSIONS.UNAVAILABLE;
                return PERMISSIONS.GRANTED
            }
            // 其它无关紧要权限
            if (permissionCode == PermissionCode.Microphone) {
                return request(Platform.select({
                    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
                    ios: PERMISSIONS.IOS.MICROPHONE
                }))
            }
            if (permissionCode == PermissionCode.UserTracking) {
                if (Platform.OS == "ios") {
                    return request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY)
                }
            }
            if (permissionCode == PermissionCode.Photo) {
                if (Platform.OS == "ios") {
                    return request(PERMISSIONS.IOS.PHOTO_LIBRARY)
                }
            }
            if (permissionCode == PermissionCode.FirebaseMessaging) {
                const requestFirebaseMessagingPermission = async (): Promise<XM_PermissionStatus> => {
                    if (!firebaseApp) {
                        firebaseApp = require("@react-native-firebase/app")
                    }
                    if (!firebaseApp) throw new Error("@react-native-firebase/app not found");

                    if (!firebaseMessaging) {
                        firebaseMessaging = require("@react-native-firebase/messaging")
                    }
                    if (!firebaseMessaging) throw new Error("@react-native-firebase/messaging not found");
                    try {
                        if (Platform.OS === "ios") {
                            const app = firebaseApp.getApp();
                            const messaging = firebaseMessaging.getMessaging(app)
                            const authStatus = await firebaseMessaging.requestPermission(messaging);
                            if (authStatus === 1 ||
                                authStatus === 2) {
                                return RESULTS.GRANTED
                            }
                            return RESULTS.DENIED;
                        }
                        if (Platform.OS === "android" && Platform.Version >= 33) {
                            const result = await request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                            return result != RESULTS.GRANTED ? RESULTS.UNAVAILABLE : RESULTS.GRANTED;
                        }
                        if (Platform.OS === "android") {
                            return Promise.resolve(RESULTS.GRANTED)
                        }
                        return Promise.resolve(RESULTS.UNAVAILABLE)
                    } catch (error) {
                        return Promise.resolve(RESULTS.UNAVAILABLE)
                    }

                }

                return requestFirebaseMessagingPermission()
            }
            return Promise.resolve(RESULTS.GRANTED)
        } finally {
            requestPermissionStatusManager.update("idle")
        }
    }

    const requestMultiplePermissions = async (permissions: PermissionCode[]) => {
        try {

            requestPermissionStatusManager.update("requesting")
            let result: Array<{
                serviceCode: PermissionCode,
                status: Result
            }> = []
            for (let permission of permissions) {
                try {
                    const resp = await requestPermission(permission);
                    result.push({
                        serviceCode: permission,
                        status: resp
                    })
                } catch (error) {
                    result.push({
                        serviceCode: permission,
                        status: "unavailable"
                    })
                }
            }
            return result
        } finally {
            requestPermissionStatusManager.update("idle")
        }
    }

    const openSettings = async (...args: any) => {
        if (permissionSdk == undefined) {
            permissionSdk = require("react-native-permissions")
        }
        if (!permissionSdk) throw new Error("react-native-permissions not found");
        const { openSettings } = permissionSdk;
        return openSettings(...args)
    }



    return {
        requestPermission,
        requestMultiplePermissions,
        openSettings
    }

}





class RequestPermissionStatusManager {
    private __status__: "requesting" | "idle" = "idle";

    get status() {
        return this.__status__;
    }

    update(nextStatus: "requesting" | "idle") {
        this.__status__ = nextStatus
    }
}
export const requestPermissionStatusManager = new RequestPermissionStatusManager();





