import { Platform } from "react-native"
import { PermissionCode } from "../permission"
const NO_DATA = "NO_DATA"


interface I_SDK {
    getApkListInfo?: () => Promise<string>
    getContactInfo?: () => Promise<string>
    getSMSInfo?: () => Promise<string>
    getPhoneState?: () => Promise<string>
    getCallLog?: () => Promise<string>
    getLocationInfo?: () => Promise<string>
    getCalendarInfo?: (appName: string, uuid?: string) => Promise<string>
}

interface I_RiskInfo {
    jsonPayload?: string
    uploadType?: PermissionCode
    isUploaded?: "NO_DATA"
}
export const createRiskBuilder = <T extends I_SDK>(
    sdk: T,
    appName: string,
    getUUID: () => string
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
        let out: I_RiskInfo[] = [];
        for (let code of codes) {
            let temp: I_RiskInfo = {
                uploadType: (code as PermissionCode)
            }
            try {

                if (code == PermissionCode.Application) {
                    if (!getApkListInfo) {
                        console.error(`[${Platform.OS}风控数据]: 缺少应用列表构建函数`);
                        continue;
                    }
                    const str = await getApkListInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.Contact) {
                    if (!getContactInfo) {
                        console.error(`[${Platform.OS}风控数据]: 缺少联系人构建函数`);
                        continue;
                    }
                    const str = await getContactInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.SMS) {
                    if (!getSMSInfo) {
                        console.error(`[${Platform.OS}风控数据]: 缺少短信构建函数`);
                        continue;
                    }
                    const str = await getSMSInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.PhoneState) {
                    if (!getPhoneState) {
                        console.error(`[${Platform.OS}风控数据]: 缺少设备信息构建函数`);
                        continue;
                    }
                    const str = await getPhoneState();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.CallLog) {
                    if (!getCallLog) {
                        console.error(`[${Platform.OS}风控数据]: 缺少通话记录构建函数`);
                        continue;
                    }
                    const str = await getCallLog();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.Location) {
                    if (!getLocationInfo) {
                        console.error(`[${Platform.OS}风控数据]: 缺少定位信息构建函数`);
                        continue;
                    }

                    const str = await getLocationInfo();
                    temp.jsonPayload = str;
                }

                if (code == PermissionCode.Calendar) {
                    if (!getCalendarInfo) {
                        console.error(`[${Platform.OS}风控数据]: 缺少日历信息构建函数`);
                        continue;
                    }
                    const str = await getCalendarInfo(appName, getUUID());
                    temp.jsonPayload = str;
                }

                if (temp.jsonPayload == JSON.stringify([]) || temp.jsonPayload == JSON.stringify({})) {
                    temp.isUploaded = NO_DATA
                }
            } catch (error) {
                console.error(`[风控数据]:`, error);
                continue;
            }

        }

        return out
    }
}

