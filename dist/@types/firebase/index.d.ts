export interface I_BasicFirebase {
    getApp(...args: any[]): any;
    deleteToken(...args: any[]): Promise<void>;
    getMessaging(...args: any[]): any;
    isDeviceRegisteredForRemoteMessages(...args: any[]): boolean;
    registerDeviceForRemoteMessages(...args: any[]): Promise<void>;
    getAnalytics(...args: any[]): any;
    requestPermission(...args: any[]): Promise<any>;
}
export declare const useFirebase: <T extends I_BasicFirebase>(module: T) => {
    getMessagingID: () => Promise<Promise<any>>;
    getFirebaseAnalyticsID: () => Promise<Promise<any>>;
    deleteFirebaseMessagingToken: () => Promise<Promise<void>>;
    getFirebaseTokens: () => Promise<Partial<{
        deviceToken: string | null | undefined;
        appInstanceId: string | null | undefined;
    }>>;
};
