interface I_BasicModule {
    getAppsFlyerUID: (callback: (error: any, uid: string) => void) => void
    initSdk: (options: any) => Promise<string>
    setCustomerUserId(userId: string, successC?: (error?: Error | undefined) => unknown): void;
}


export class AppsFlyerProvider<T extends I_BasicModule> {


    private module: T | null = null;
    getModule() {
        if (!this.module) {
            throw new Error("[AppsFlyerProvider] Module not injected");
        }
        return this.module;
    }
    init(module: T) {
        this.module = module;
    }
    initSdk = (options: Parameters<T["initSdk"]>[0]) => {
        const module = this.getModule();
        return module.initSdk({
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 30,
            ...options
        })
    }



    getAppsFlyerUID = async () => {
        const module = this.getModule();
        return new Promise<string>((resolve, reject) => {
            module.getAppsFlyerUID((error, uid) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(uid);
                }
            })
        })
    }
    setCustomerUserId = (userId: string) => {
        const module = this.getModule();
        return new Promise<boolean>((s, e) => {
            module.setCustomerUserId(userId, (error) => {
                if (error) return e(error)
                s(true)
            })
        })

    }
}
export const AppsFlyerProviderInstance = new AppsFlyerProvider();