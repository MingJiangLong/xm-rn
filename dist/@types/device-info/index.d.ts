type I_DeviceBasicModule = {
    isBatteryCharging: () => Promise<boolean>;
    getDeviceId: () => string;
    getSystemVersion: () => string;
    getBatteryLevel: () => Promise<number>;
    getApplicationName: () => string;
    getBundleId: () => string;
    getVersion: () => string;
    getUniqueId: () => Promise<string>;
    getDeviceName: () => Promise<string>;
    getIpAddress: () => string;
    getBrand: () => string;
    getModel: () => string;
    getAndroidId: () => Promise<string>;
    syncUniqueId: () => Promise<any>;
    check: () => Promise<boolean>;
};
export declare const useDeviceInfo: <T extends I_DeviceBasicModule>(DeviceInfo: T) => {
    buildIOSDeviceInfo: () => Promise<string>;
    buildDefaultPostData: () => Promise<{
        reqSource: string;
        phoneName: string | undefined;
        appVersion: string;
        androidversion: string | undefined;
        deviceID: any;
    }>;
    buildWebviewEnv: () => Promise<{
        appName: string;
        appPackageName: string;
        appVersion: string;
        platform: string;
        deviceId: string;
        phoneName: string;
        androidVersion: string;
        appType: string;
    }>;
};
export {};
