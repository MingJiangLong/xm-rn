export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'limited' | 'unavailable';
import { Platform } from "react-native";
import FirebaseProviderInstance from "../firebase";
import CalendarProviderInstance from "../calendar";
export interface PermissionHandler {
    request: () => Promise<PermissionStatus> | PermissionStatus;
}
export type I_PermissionMapping = {
    [key in Permission]?: PermissionHandler;
} & {
    [key: string]: PermissionHandler;
};
export interface IPermissionEngine {
    check: (permission: any) => Promise<any>;
    request: (permission: any) => Promise<any>;
    PERMISSIONS: any;
    RESULTS: any;
}


export enum Permission {
    Camera = "0",
    ApplicationList = "1",
    Contact = "2",
    SMS = "4",
    Location = "5",
    PhoneState = "6",
    Photo = "10",
    Calendar = "12",
    Microphone = "13",
    FirebaseMessaging = "-1",
    UserTracking = "-2",
}

class PermissionProvider {

    private defaultMapping: I_PermissionMapping = {};
    private customMapping: I_PermissionMapping = {};

    init(engine?: IPermissionEngine, customMapping?: I_PermissionMapping) {

        if (engine) {
            this.defaultMapping = this.createDefaultEngineMapping(engine);
        }
        if (customMapping) {
            this.customMapping = customMapping
        }
    }

    private createDefaultEngineMapping(engine: IPermissionEngine): I_PermissionMapping {
        const { PERMISSIONS } = engine;
        const isShortcutStatus = (val: any) =>
            val === "granted" || val === "unavailable" || val === "denied" || val === "blocked" || val === "limited";
        const wrap = (p: any): PermissionHandler => ({
            request: async () => {
                try {
                    if (p == undefined) return "unavailable";
                    if (isShortcutStatus(p)) return p;
                    const res = await engine.request(p);
                    return this.parseStatus(engine, res);
                } catch (e) { return 'unavailable'; }
            }
        });

        return {
            [Permission.Camera]: wrap(Platform.select({
                ios: PERMISSIONS.IOS?.CAMERA,
                android: PERMISSIONS.ANDROID?.CAMERA
            })),
            [Permission.ApplicationList]: wrap("granted"),
            [Permission.Contact]: wrap(Platform.select({
                ios: PERMISSIONS.IOS?.CONTACTS,
                android: "unavailable"
            })),
            [Permission.SMS]: wrap(Platform.select({
                android: PERMISSIONS.ANDROID?.READ_SMS,
                ios: "unavailable"
            })),
            [Permission.Location]: wrap(Platform.select({
                android: PERMISSIONS.ANDROID?.ACCESS_COARSE_LOCATION,
                ios: PERMISSIONS.IOS?.LOCATION_WHEN_IN_USE
            })),
            [Permission.PhoneState]: wrap("granted"),
            [Permission.Microphone]: wrap(Platform.select({
                ios: PERMISSIONS.IOS?.MICROPHONE,
                android: PERMISSIONS.ANDROID?.RECORD_AUDIO
            })),
            [Permission.Photo]: wrap("granted"),
            [Permission.UserTracking]: wrap(Platform.select({
                ios: PERMISSIONS.IOS?.APP_TRACKING_TRANSPARENCY,
                android: "granted"
            })),
            [Permission.FirebaseMessaging]: {
                request: async () => {
                    const resp = await FirebaseProviderInstance.requestNotificationPermission()
                    if (resp) return "granted"
                    return "denied"
                }
            },
            [Permission.Calendar]: {
                request: async () => CalendarProviderInstance.requestPermissions(),
            }

        };
    }


    private getHandler(code: Permission | string): PermissionHandler | undefined {
        return this.customMapping[code] || this.defaultMapping[code];
    }

    private parseStatus(engine: IPermissionEngine, status: string): PermissionStatus {
        const { RESULTS } = engine;
        if (status === RESULTS.GRANTED) return 'granted';
        if (status === RESULTS.DENIED) return 'denied';
        if (status === RESULTS.BLOCKED) return 'blocked';
        if (status === RESULTS.LIMITED) return 'limited';
        return 'unavailable';
    }


    /** 请求权限 */
    async request(code: Permission | string): Promise<PermissionStatus> {

        const handler = this.getHandler(code);
        if (!handler) throw new Error(`${code} request handler not found`);
        try {
            return await handler.request();
        } catch (e) {
            return 'unavailable';
        }
    }

}

const PermissionProviderInstance = new PermissionProvider();
export default PermissionProviderInstance;


