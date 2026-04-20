import { Platform } from "react-native"
import { addTimeout } from "../add-timeout";
import { toFixed } from "../format/to-fixed";


type I_DeviceBasicModule = {

    isBatteryCharging: () => Promise<boolean>
    getDeviceId: () => string
    getSystemVersion: () => string
    getBatteryLevel: () => Promise<number>
    getApplicationName: () => string
    getBundleId: () => string
    getVersion: () => string
    getUniqueId: () => Promise<string>
    getDeviceName: () => Promise<string>
    getIpAddress: () => Promise<string>
    getBrand: () => string
    getModel: () => string
    getAndroidId: () => Promise<string>
    syncUniqueId: () => Promise<any>
    // check: () => Promise<boolean>
}
type JailBreakSdk = {
    check: () => Promise<boolean>
}

const DEVICE_SDK_NAME = "react-native-device-info"
const JAIL_BREAK_SDK_NAME = "react-native-jail-break"
export const useDeviceInfo = <T extends I_DeviceBasicModule, D extends JailBreakSdk>(deviceInfoSdk?: T, jailbreakSdk?: D) => {

    const getDeviceInfoModule = () => {
        let deviceInfo = deviceInfoSdk;
        if (!deviceInfoSdk) {
            deviceInfo = require("react-native-device-info").default
        }
        if (!deviceInfo) throw new Error("react-native-device-info not found")
        return deviceInfo;
    }

    const getJailbreakModule = () => {
        let jailBreak = jailbreakSdk;
        if (!jailBreak) {
            jailBreak = require("react-native-jail-break").default
        }
        if (!jailBreak) throw new Error("react-native-jail-break not found")
        return jailBreak;
    }
    const fetchIpAddress = addTimeout(
        async function (url: string = "https://icanhazip.com/") {
            try {
                let resp = await fetch(url)
                return (await resp?.text()).trim();
            } catch (e) {
                const deviceInfoSdk = getDeviceInfoModule()
                return deviceInfoSdk.getIpAddress();
            }
        }
    )
    async function buildDeviceInfo() {
        const deviceInfoSdk = getDeviceInfoModule()
        const jailBreakSdk = getJailbreakModule()
        const batteryCharging = await deviceInfoSdk.isBatteryCharging();
        let chargingStatus = 3
        if (batteryCharging) { chargingStatus = 2; }
        const result = {
            appChannel: Platform.OS,
            publicIpAddress: await fetchIpAddress(), //
            deviceNo: await deviceInfoSdk.getUniqueId(),
            deviceName: "iPhone",
            manufacturer: 'Apple',
            model: deviceInfoSdk.getDeviceId(),
            systemVersion: deviceInfoSdk.getSystemVersion(),
            chargingStatus: chargingStatus, //充电状态 充电状态2:充电中;3:未充电;  5:已满电;1:其他未知状态
            batteryPercentage: toFixed(await deviceInfoSdk.getBatteryLevel()),
            rooted: await jailBreakSdk.check(),  //是否越狱
            appPackage: deviceInfoSdk.getBundleId(),
            appVersionName: deviceInfoSdk.getVersion(),
            appName: deviceInfoSdk.getApplicationName(),

        };
        return JSON.stringify(result)
    }

    const buildDefaultPostData = async () => {
        const deviceInfoSdk = getDeviceInfoModule()
        const phoneName = Platform.select({
            android: `${deviceInfoSdk.getBrand()} ${deviceInfoSdk.getModel()}`,
            ios: await deviceInfoSdk.getDeviceName()
        })

        const version = Platform.select({
            android: `android ${deviceInfoSdk.getSystemVersion()}`,
            ios: `iOS ${deviceInfoSdk.getSystemVersion()}`
        })

        const deviceID = Platform.select({
            ios: await deviceInfoSdk.syncUniqueId(),
            android: await deviceInfoSdk.getAndroidId()
        })

        const temp = {
            reqSource: Platform.select({
                ios: 'Ios',
                android: 'Android'
            }) ?? "Android",
            phoneName,
            appVersion: deviceInfoSdk.getVersion(),
            androidversion: version,
            deviceID,
        }
        return Promise.resolve(temp);
    }
    const buildWebviewEnv = async () => {
        const deviceInfoSdk = getDeviceInfoModule()
        const iosName = await deviceInfoSdk.getDeviceName();
        const androidName = `${deviceInfoSdk.getBrand()} ${deviceInfoSdk.getModel()}`
        const phoneName = Platform.select({
            ios: iosName,
            android: androidName
        }) ?? ""
        const deviceId = Platform.select({
            android: await deviceInfoSdk.getAndroidId(),
            ios: await deviceInfoSdk.getUniqueId()
        }) ?? ""
        const androidVersion = `android ${deviceInfoSdk.getSystemVersion()}`
        const iosVersion = `iOS${deviceInfoSdk.getSystemVersion()}`

        const version = Platform.select({
            android: androidVersion,
            ios: iosVersion
        }) ?? ""

        return {
            appName: deviceInfoSdk.getApplicationName(),
            appPackageName: deviceInfoSdk.getBundleId(),
            appVersion: deviceInfoSdk.getVersion(),
            platform: Platform.select({
                ios: 'Ios',
                android: 'Android'
            }) ?? "Android",
            deviceId,
            phoneName: phoneName,
            androidVersion: version,
            appType: "rn",
        }
    }
    return {
        buildDeviceInfo,
        buildDefaultPostData,
        buildWebviewEnv,
        fetchIpAddress
    }
}

