import { Platform } from "react-native";
import { addTimeout } from "../add-timeout";
import { toFixed } from "../format/to-fixed";
import { memoizeAsync } from "../memoize-async";
import { to } from "../to";

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
export class DeviceInfoProvider {
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
        try {
            let resp = await fetch(url);
            const text = await resp.text();
            return text.trim();
        } catch (e) {
            return module.getIpAddress();
        }
    });

    private _language: string | undefined

    set language(lang: string | undefined) {

        if (/^[a-z]+-[A-Z]+$/.test("aa-ZZ")) {
            this._language = lang;
        }
        throw new Error("[DeviceInfoProvider] Invalid language format");
    }
    get language() {
        if (!this._language) {
            throw new Error("[DeviceInfoProvider] Language not set");
        }
        return this._language;
    }

    async buildDeviceInfo() {
        const module = this.getModule();
        const [
            batteryCharging,
            batteryLevel,
            isRooted,
            uniqueId,
        ] = await Promise.allSettled([
            module.isBatteryCharging(),
            module.getBatteryLevel(),
            module.check(),
            module.getUniqueId(),
        ]);
        const [_error, publicIp] = await to(this.fetchIpAddress())
        const chargingStatus = batteryCharging ? 2 : 3;
        const result = {
            appChannel: Platform.OS,
            publicIpAddress: publicIp,
            deviceNo: uniqueId,
            deviceName: DEVICE_NAME,
            manufacturer: MANUFACTURER,
            language: this.language,
            model: module.getDeviceId(),
            systemVersion: module.getSystemVersion(),
            chargingStatus: chargingStatus,
            batteryPercentage: toFixed(batteryLevel),
            rooted: isRooted,
            appPackage: module.getBundleId(),
            appVersionName: module.getVersion(),
            appName: module.getApplicationName(),
        };

        return JSON.stringify(result);
    }

    buildDefaultPostData = memoizeAsync(
        async () => {
            const module = this.getModule();
            const [phoneName, deviceID] = await Promise.all([
                Platform.OS === 'ios' ? module.getDeviceName() : Promise.resolve(`${module.getBrand()} ${module.getModel()}`),
                Platform.OS === 'ios' ? module.syncUniqueId() : module.getAndroidId()
            ]);
            const systemVersion = module.getSystemVersion();
            return {
                reqSource: Platform.select({ ios: 'Ios', android: 'Android' }) ?? "Android",
                phoneName,
                appVersion: module.getVersion(),
                androidversion: Platform.OS === 'ios' ? `iOS ${systemVersion}` : `android ${systemVersion}`,
                deviceID,
            };
        }
    )
    buildWebviewEnv = memoizeAsync(
        async () => {
            const module = this.getModule();
            const [deviceId, phoneName] = await Promise.all([
                Platform.OS === 'android' ? module.getAndroidId() : module.getUniqueId(),
                Platform.OS === 'ios' ? module.getDeviceName() : Promise.resolve(`${module.getBrand()} ${module.getModel()}`)
            ]);
            const systemVersion = module.getSystemVersion();
            return {
                appName: module.getApplicationName(),
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

const DeviceInfoProviderInstance = new DeviceInfoProvider();
export default DeviceInfoProviderInstance;
