import { I_BasicFirebase } from "../firebase";
type I_PermissionBasicModule = {
    PERMISSIONS: any;
    RESULTS: any;
    request: (...args: any[]) => Promise<any>;
    requestMultiple: (...args: any[]) => Promise<any>;
    openSettings: (...args: any) => Promise<any>;
};
type XM_PermissionStatus = "unavailable" | "blocked" | "denied" | "granted" | "limited" | "ignored_permission";
export declare enum PermissionCode {
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
    Wifi = "11"
}
export declare const usePermission: <T extends I_PermissionBasicModule, F extends I_BasicFirebase>(permissionModule: T, firebaseModule: F) => {
    requestPermission: (permissionCode: PermissionCode) => Promise<XM_PermissionStatus>;
    requestMultiplePermissions: (permissions: PermissionCode[]) => Promise<({
        serviceCode: PermissionCode;
        status: XM_PermissionStatus;
    } | {
        serviceCode: PermissionCode.Camera | PermissionCode.Application | PermissionCode.Contact | PermissionCode.SMS | PermissionCode.Location | PermissionCode.PhoneState | PermissionCode.CallLog | PermissionCode.Calendar | PermissionCode.Microphone | PermissionCode.UserTracking | PermissionCode.Photo | PermissionCode.Finger | PermissionCode.PersonalInfo | PermissionCode.Wifi;
        status: any;
    })[]>;
    updatePermissionsInfoMap: (permissionsInfo: Record<PermissionCode, any>) => void;
    openSettings: (...args: any) => Promise<any>;
};
declare class RequestPermissionStatusManager {
    private __status__;
    get status(): "requesting" | "idle";
    update(nextStatus: "requesting" | "idle"): void;
}
export declare const requestPermissionStatusManager: RequestPermissionStatusManager;
export {};
