import { Platform } from "react-native"
import { PermissionCode, usePermission } from "../permission"
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
}

interface I_RiskInfo {
    jsonPayload?: string
    uploadType?: PermissionCode
    isUploaded?: "NO_DATA"
}
export const createRiskBuilder = <T extends I_SDK>(
    sdk: T,
) => {

    let {
        getApkListInfo,
        getContactInfo,
        getSMSInfo,
        getPhoneState,
        getCallLog,
        getLocationInfo,
        getCalendarInfo
    } = sdk
    return async (codes: PermissionCode[]) => {
        const permissionSdk = usePermission();
        const statusList = await permissionSdk.requestMultiplePermissions(codes)
        const leftCodes = statusList.filter(item => item.status === "granted").map(item => item.serviceCode);
        const out: I_RiskInfo[] = [];
        for (const code of leftCodes) {
            let temp: I_RiskInfo = {
                uploadType: (code as PermissionCode)
            }
            try {

                if (code == PermissionCode.Application) {
                    if (!getApkListInfo) {
                        console.error(`[风控数据${Platform.OS}] 缺少应用列表构建函数getApkListInfo`);
                        continue;
                    }
                    const str = await getApkListInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.Contact) {
                    if (!getContactInfo) {
                        console.error(`[风控数据${Platform.OS}] 缺少联系人构建函数getContactInfo`);
                        continue;
                    }
                    const str = await getContactInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.SMS) {
                    if (!getSMSInfo) {
                        console.error(`[风控数据${Platform.OS}] 缺少短信构建函数getSMSInfo`);
                        continue;
                    }
                    const str = await getSMSInfo();
                    temp.jsonPayload = gzip(str);
                }

                if (code == PermissionCode.PhoneState) {
                    if (!getPhoneState) {
                        console.error(`[风控数据${Platform.OS}] 缺少设备信息构建函数getPhoneState`);
                        continue;
                    }
                    const str = await getPhoneState();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.CallLog) {
                    if (!getCallLog) {
                        console.error(`[风控数据${Platform.OS}] 缺少通话记录构建函数getCallLog`);
                        continue;
                    }
                    const str = await getCallLog();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.Location) {
                    if (!getLocationInfo) {
                        console.error(`[风控数据${Platform.OS}] 缺少定位信息构建函数getLocationInfo`);
                        continue;
                    }

                    const str = await getLocationInfo();
                    temp.jsonPayload = (str);
                }

                if (code == PermissionCode.Calendar) {
                    if (!getCalendarInfo) {
                        console.error(`[风控数据${Platform.OS}] 缺少日历信息构建函数getCalendarInfo`);
                        continue;
                    }
                    const str = await getCalendarInfo();
                    temp.jsonPayload = (str);
                }

                if (temp.jsonPayload == JSON.stringify([]) || temp.jsonPayload == JSON.stringify({}) || temp.jsonPayload == "") {
                    temp.isUploaded = NO_DATA
                }
                out.push(temp)
            } catch (error) {
                console.error(`[风控数据${Platform.OS}] `, error);
                continue;
            }
        }

        return out
    }
}

