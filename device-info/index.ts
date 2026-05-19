import { Platform } from "react-native";
import { addTimeout } from "../add-timeout";
import { toFixed } from "../format/to-fixed";
import { memoizeAsync } from "../memoize-async";
import { allSync, to, toSync } from "../to";

type I_DeviceBasicModule = {
    isBatteryCharging: (...args: any[]) => Promise<boolean>;
    getDeviceId: (...args: any[]) => string;
    getSystemVersion: (...args: any[]) => string;
    getBatteryLevel: (...args: any[]) => Promise<number>;
    getApplicationName: (...args: any[]) => string;
    getBundleId: (...args: any[]) => string;
    getVersion: (...args: any[]) => string;
    getUniqueId: (...args: any[]) => Promise<string>;
    getDeviceName: (...args: any[]) => Promise<string>;
    getIpAddress: (...args: any[]) => Promise<string>;
    getBrand: (...args: any[]) => string;
    getModel: (...args: any[]) => string;
    getAndroidId: (...args: any[]) => Promise<string>;
    syncUniqueId: (...args: any[]) => Promise<any>;
    check: (...args: any[]) => Promise<boolean>;
};

const DEVICE_NAME = "iPhone"
const MANUFACTURER = "Apple"
class DeviceInfoProvider {
    private module: I_DeviceBasicModule | null = null;


    init<T extends I_DeviceBasicModule>(module: T) {
        this.module = module;
    }

    private getModule() {
        if (!this.module) {
            throw new Error("[DeviceInfoProvider] Module not injected");
        }
        return this.module;
    }

    fetchIpAddress = addTimeout(async (url = "https://icanhazip.com/") => {
        const module = this.getModule();
        const [error, resp] = await to(fetch(url))
        if (error) {
            const [_error, resp] = await to(module.getIpAddress());
            return resp;
        }
        const text = await resp.text();
        return text.trim();
    });

    private _language: string | undefined

    set language(lang: string | undefined) {

        if (/^[a-z]+-[A-Z]+$/.test(lang ?? "")) {
            this._language = lang;
        } else {
            throw new Error("[DeviceInfoProvider] Invalid language format");
        }
    }
    get language() {
        if (!this._language) {
            throw new Error("[DeviceInfoProvider] Language not set");
        }
        return this._language;
    }

    buildDeviceInfo = async () => {
        const module = this.getModule();
        const [
            [_error, batteryCharging],
            [_error2, batteryLevel],
            [_error3, isRooted],
            [_error4, uniqueId],
            [_error5, publicIp]
        ] = await Promise.all([
            to(module.isBatteryCharging()),
            to(module.getBatteryLevel()),
            to(module.check()),
            to(module.getUniqueId()),
            to(this.fetchIpAddress()),
        ]);
        const chargingStatus = batteryCharging ? 2 : 3;

        const [
            [_error6, deviceId],
            [_error7, systemVersion],
            [_error8, bundleId],
            [_error9, appVersion],
            [_error10, appName]
        ] = allSync([
            module.getDeviceId,
            module.getSystemVersion,
            module.getBundleId,
            module.getVersion,
            module.getApplicationName
        ])
        const result = {
            appChannel: Platform.OS.toLowerCase(),
            publicIpAddress: publicIp,
            deviceNo: uniqueId,
            deviceName: DEVICE_NAME,
            manufacturer: MANUFACTURER,
            language: this.language,
            model: deviceId,
            systemVersion: systemVersion,
            chargingStatus: chargingStatus,
            batteryPercentage: toFixed(batteryLevel),
            rooted: isRooted,
            appPackage: bundleId,
            appVersionName: appVersion,
            appName: appName,
        };
        return JSON.stringify(result);
    }

    buildDefaultPostData = memoizeAsync(
        async () => {
            const module = this.getModule();
            const [
                [_error, deviceName],
                [_error2, uniqueId],
                [_error3, androidId],
                [_error4, brand],
                [_error5, model],
                [_error6, systemVersion],
                [_error7, version],
            ] = await Promise.all([
                to(module.getDeviceName()),
                to(module.syncUniqueId()),
                to(module.getAndroidId()),
                toSync(module.getBrand),
                toSync(module.getModel),
                toSync(module.getSystemVersion),
                toSync(module.getVersion),
            ]);
            const phoneName = Platform.OS === 'ios' ? deviceName : `${brand} ${model}`;
            const deviceID = Platform.OS === 'ios' ? uniqueId : androidId
            return {
                reqSource: Platform.select({ ios: 'Ios', android: 'Android' }) ?? "Android",
                phoneName,
                appVersion: version,
                androidversion: Platform.OS === 'ios' ? `iOS ${systemVersion}` : `android ${systemVersion}`,
                deviceID,
            };
        }
    )
    buildWebviewEnv = memoizeAsync(
        async () => {
            const module = this.getModule();
            const [
                [_error, deviceName],
                [_error2, uniqueId],
                [_error3, androidId],
                [_error4, brand],
                [_error5, model],
                [_error6, systemVersion],
                [_error7, appName],
            ] = await Promise.all([
                to(module.getDeviceName()),
                to(module.syncUniqueId()),
                to(module.getAndroidId()),
                toSync(module.getBrand),
                toSync(module.getModel),
                toSync(module.getSystemVersion),
                toSync(module.getApplicationName),

            ]);
            const phoneName = Platform.OS === 'ios' ? deviceName : `${brand} ${model}`;
            const deviceId = Platform.OS === 'ios' ? uniqueId : androidId
            return {
                appName,
                appPackageName: module.getBundleId(),
                appVersion: module.getVersion(),
                platform: Platform.select({ ios: 'Ios', android: 'Android' }) ?? "Android",
                deviceId,
                phoneName,
                androidVersion: Platform.OS === 'ios' ? `iOS${systemVersion}` : `android ${systemVersion}`,
                appType: "rn",
            };
        }
    )
}

export const DeviceInfoProviderInstance = new DeviceInfoProvider();
