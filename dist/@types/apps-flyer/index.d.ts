interface I_BasicModule {
    getAppsFlyerUID: (callback: (error: any, uid: string) => void) => void;
    initSdk: (options: any) => Promise<string>;
    setCustomerUserId(userId: string, successC?: (error?: Error | undefined) => unknown): void;
}
declare const useAppsFlyer: <T extends I_BasicModule>(module: T) => {
    initSdk: (options: Parameters<T["initSdk"]>[0]) => Promise<string>;
    getAppsFlyerUID: () => Promise<string>;
    setCustomerUserId: (userId: string) => Promise<boolean>;
};
