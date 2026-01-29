interface I_BasicModule {
    getAppsFlyerUID: (callback: (error: any, uid: string) => void) => void
    initSdk: (options: any) => Promise<string>
    setCustomerUserId(userId: string, successC?: (error?: Error | undefined) => unknown): void;
}


export const useAppsFlyer = <T extends I_BasicModule>(module: T) => {

    const initSdk = (options: Parameters<T["initSdk"]>[0]) => {
        return module.initSdk({
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 30,
            ...options
        })
    }
    const getAppsFlyerUID = () => {
        return new Promise<string>((s, e) => {
            module.getAppsFlyerUID((error: any, uid) => {

                if (error) return e(error)
                s(uid)
            })
        })
    }

    const setCustomerUserId = (userId: string) => {
        return new Promise<boolean>((s, e) => {
            module.setCustomerUserId(userId, (error) => {
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