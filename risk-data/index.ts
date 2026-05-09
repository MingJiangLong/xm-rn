import { Platform } from "react-native";
import { PermissionCode } from "../permission";
import pako from 'pako';
import { Buffer } from 'buffer';
import { to } from "../to";

const NO_DATA = "NO_DATA";

function gzip(strData: string): string {
    if (strData.length <= 100) return strData;
    const input = Buffer.from(strData, "utf-8");
    const inputUint8Array = pako.gzip(input);
    return Buffer.from(inputUint8Array).toString("base64");
}

export interface I_SDK {
    getApkListInfo?: () => Promise<string>;
    getContactInfo?: () => Promise<string>;
    getSMSInfo?: () => Promise<string>;
    getPhoneState?: () => Promise<string>;
    getCallLog?: () => Promise<string>;
    getLocationInfo?: () => Promise<string>;
    getCalendarInfo?: () => Promise<string>;
    getSchemaInfo?: () => Promise<string>;
}
type StrategyConfig = {
    method: keyof I_SDK;
    compress?: boolean;
    platform?: typeof Platform.OS;
};
export interface I_RiskInfo {
    jsonPayload?: string;
    uploadType?: PermissionCode;
    isUploaded?: typeof NO_DATA;
}

const RISK_STRATEGIES: Partial<Record<PermissionCode, StrategyConfig>> = {
    [PermissionCode.Application]: { method: 'getApkListInfo' },
    [PermissionCode.Contact]: { method: 'getContactInfo' },
    [PermissionCode.SMS]: { method: 'getSMSInfo', compress: true },
    [PermissionCode.Location]: { method: 'getLocationInfo' },
    [PermissionCode.PhoneState]: { method: 'getPhoneState' },
    [PermissionCode.CallLog]: { method: 'getCallLog' },
    [PermissionCode.Calendar]: { method: 'getCalendarInfo' },
    [PermissionCode.Schema]: { method: 'getSchemaInfo', platform: 'ios' },
};

export const createRiskBuilder = <T extends I_SDK>(
    sdk: T,
) => {

    const finalStrategies = { ...RISK_STRATEGIES };

    return async (codes: PermissionCode[]): Promise<I_RiskInfo[]> => {
        const activeCodes = new Set(codes);
        if (activeCodes.has(PermissionCode.Application)) {
            activeCodes.add(PermissionCode.Schema);
        }

        const tasks = Array.from(activeCodes).map(async (code) => {
            const strategy = finalStrategies[code];
            if (!strategy) return null;
            if (strategy.platform && Platform.OS !== strategy.platform) return null;

            const fetcher = sdk[strategy.method];
            if (typeof fetcher !== 'function') return null;

            const [err, rawData] = await to(fetcher.call(sdk));

            if (err) {
                console.error(`[风控数据${Platform.OS}] 任务 ${code} 失败:`, err);
                return null;
            }

            let payload = rawData || "";
            const temp: I_RiskInfo = { uploadType: code };

            if (strategy.compress && payload) {
                payload = gzip(payload);
            }

            temp.jsonPayload = payload;

            if (payload === "[]" || payload === "{}" || !payload) {
                temp.isUploaded = NO_DATA;
            }
            return (temp.jsonPayload || temp.isUploaded) ? temp : null;
        });

        const results = await Promise.all(tasks);
        return results.filter((item): item is I_RiskInfo => item !== null);
    };
};

