import { Platform } from "react-native";

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'limited' | 'unavailable';

/** 底层权限引擎接口 (适配 react-native-permissions) */
export interface IPermissionEngine {
    check: (permission: any) => Promise<any>;
    request: (permission: any) => Promise<any>;
    PERMISSIONS: any;
    RESULTS: any;
}
type ICustomPermissionEngine ={
    
}[]
/** 单个权限处理器 */
export interface PermissionHandler {
    check: () => Promise<PermissionStatus> | PermissionStatus;
    request: () => Promise<PermissionStatus> | PermissionStatus;
}

export type I_PermissionMapping = {
    [key in PermissionCode]?: PermissionHandler;
} & {
    [key: string]: PermissionHandler; // 兼容字符串代码
};

/** 业务权限代码枚举 */
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
    Schema = "13"
}

