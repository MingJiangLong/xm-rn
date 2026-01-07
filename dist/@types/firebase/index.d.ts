export interface I_BasicFirebase {
    getApp(...args: any[]): any;
    deleteToken(...args: any[]): Promise<void>;
    getMessaging(...args: any[]): any;
    isDeviceRegisteredForRemoteMessages(...args: any[]): boolean;
    registerDeviceForRemoteMessages(...args: any[]): Promise<void>;
    getAnalytics(...args: any[]): any;
    requestPermission(...args: any[]): Promise<any>;
}
