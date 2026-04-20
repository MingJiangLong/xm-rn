interface I_BasicModule {
    getAppsFlyerUID: (callback: (error: any, uid: string) => void) => void
    initSdk: (options: any) => Promise<string>
    setCustomerUserId(userId: string, successC?: (error?: Error | undefined) => unknown): void;
}


export const useAppsFlyer = <T extends I_BasicModule>(module: T) => {
    const getSdk = () => {

        if (!module) throw new Error("argument module is required")

        return module;
    }
    const initSdk = (options: Parameters<T["initSdk"]>[0]) => {

        const appsFlyerModule = getSdk();
        return appsFlyerModule.initSdk({
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 30,
            ...options
        })
    }
    const getAppsFlyerUID = () => {
        const appsFlyerModule = getSdk();
        return new Promise<string>((s, e) => {
            appsFlyerModule.getAppsFlyerUID((error: any, uid: string) => {
                if (error) return e(error)
                s(uid)
            })
        })
    }

    const setCustomerUserId = (userId: string) => {
        const appsFlyerModule = getSdk();
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