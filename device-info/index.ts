import { Platform } from "react-native";
import { addTimeout } from "../add-timeout";
import { toFixed } from "../format/to-fixed";
import { memoizeAsync } from "../memoize-async";

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

    /**
     * 构建 iOS 设备详细信息 (风控用)
     */
    async buildIOSDeviceInfo() {
        const module = this.getModule();

        // 并行获取所有异步字段，大幅缩短等待时间
        const [
            batteryCharging,
            batteryLevel,
            isRooted,
            publicIp,
            uniqueId,
        ] = await Promise.all([
            module.isBatteryCharging(),
            module.getBatteryLevel(),
            module.check(),
            this.fetchIpAddress(),
            module.getUniqueId(),
        ]);

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
            chargingStatus: chargingStatus, // 2:充电中; 3:未充电
            batteryPercentage: toFixed(batteryLevel),
            rooted: isRooted,
            appPackage: module.getBundleId(),
            appVersionName: module.getVersion(),
            appName: module.getApplicationName(),
        };

        return JSON.stringify(result);
    }

    /**
     * 构建通用的基础 Post 数据
     */
    async buildDefaultPostData() {
        const module = this.getModule();

        // 根据平台获取对应的异步 ID 和名称
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

// 导出单例
const DeviceInfoProviderInstance = new DeviceInfoProvider();
export default DeviceInfoProviderInstance;
