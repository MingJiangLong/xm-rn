interface I_BasicModule {
    getAppsFlyerUID: (callback: (error: any, uid: string) => void) => void
    initSdk: (options: any) => Promise<string>
    setCustomerUserId(userId: string, successC?: (error?: Error | undefined) => unknown): void;
}


export const useAppsFlyer = <T extends I_BasicModule>(module?: T) => {

    let appsFlyerModule: any = module;


    const checkAndInitialModule = () => {

        if (appsFlyerModule == undefined) {
            appsFlyerModule = require("react-native-appsflyer").default
        }
        if (!appsFlyerModule) throw new Error("react-native-appsflyer not found")
    }
    const initSdk = (options: Parameters<T["initSdk"]>[0]) => {
        checkAndInitialModule();
        return appsFlyerModule.initSdk({
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 30,
            ...options
        })
    }
    const getAppsFlyerUID = () => {
        checkAndInitialModule()
        return new Promise<string>((s, e) => {
            appsFlyerModule.getAppsFlyerUID((error: any, uid: string) => {
                if (error) return e(error)
                s(uid)
            })
        })
    }

    const setCustomerUserId = (userId: string) => {
        checkAndInitialModule()
        return new Promise<boolean>((s, e) => {
            appsFlyerModule.setCustomerUserId(userId, (error: any) => {
                if (error) return e(error)
                s(true)
            })
        })

    }


    return {
        initSdk,
        getAppsFlyerUID,
        setCustomerUserId
    }
}