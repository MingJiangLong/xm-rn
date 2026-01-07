import { PermissionCode } from "../permission";
interface I_SDK {
    getApkListInfo?: () => Promise<string>;
    getContactInfo?: () => Promise<string>;
    getSMSInfo?: () => Promise<string>;
    getPhoneState?: () => Promise<string>;
    getCallLog?: () => Promise<string>;
    getLocationInfo?: () => Promise<string>;
    getCalendarInfo?: (appName: string, uuid?: string) => Promise<string>;
}
interface I_RiskInfo {
    jsonPayload?: string;
    uploadType?: PermissionCode;
    isUploaded?: "NO_DATA";
}
export declare const createRiskBuilder: <T extends I_SDK>(sdk: T, appName: string, getUUID: () => string) => (codes: PermissionCode[]) => Promise<I_RiskInfo[]>;
export {};
