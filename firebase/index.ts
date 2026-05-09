import { Platform, PermissionsAndroid } from "react-native";

// 定义接口，只包含我们用到的方法
interface I_MessagingModule {
    (): {
        registerDeviceForRemoteMessages?: () => Promise<void>;
        getToken: () => Promise<string>;
        requestPermission: () => Promise<number>;
    };
}

interface I_AnalyticsModule {
    (): {
        getAppInstanceId: () => Promise<string>;
    };
}

interface I_FirebaseModules {
    messaging?: I_MessagingModule;
    analytics?: I_AnalyticsModule;
}

export class FirebaseProvider {
    private messaging: I_MessagingModule | null = null;
    private analytics: I_AnalyticsModule | null = null;

    init(modules: I_FirebaseModules) {
        this.messaging = modules.messaging || null;
        this.analytics = modules.analytics || null;
    }


    async getAnalyticsId() {
        if (!this.analytics) {
            console.log('[Firebase] analytics module not injected');
            return null;
        }

        try {
            const instanceId = await this.analytics().getAppInstanceId();
            return instanceId;
        } catch (error: any) {
            console.warn('[getAnalyticsId] failed', error.message);
            return null;
        }
    }

    /**
     * 获取推送 Token
     */
    async getToken() {
        if (!this.messaging) {
            console.log('[Firebase] messaging module not injected');
            return null;
        }

        try {
            const messagingInstance = this.messaging();
            if (messagingInstance.registerDeviceForRemoteMessages) {
                await messagingInstance.registerDeviceForRemoteMessages();
            }

            try {
                return await messagingInstance.getToken();
            } catch (e: any) {
                if (e.message?.includes('SERVICE_NOT_AVAILABLE')) {
                    await new Promise(res => setTimeout(() => res(true), 2000));
                    return await messagingInstance.getToken();
                }
                throw e;
            }
        } catch (error: any) {
            console.warn('[getToken] failed', error.message);
            return null;
        }
    }

    /**
     * 同时获取 Token 和 ID
     */
    async getTokenAndAnalyticsId() {
        const [token, analyticsId] = await Promise.all([
            this.getToken().catch(() => null),
            this.getAnalyticsId().catch(() => null),
        ]);

        const result: { deviceToken?: string; appInstanceId?: string } = {};
        if (token) result.deviceToken = token;
        if (analyticsId) result.appInstanceId = analyticsId;

        return Object.keys(result).length > 0 ? result : null;
    }

    /**
     * 请求通知权限
     */
    async requestNotificationPermission(): Promise<boolean> {
        if (!this.messaging) {
            console.log('[Firebase] messaging module not injected');
            return false;
        }

        try {
            // 1. 处理 Android 13+ 的原生权限
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    return false;
                }
            }

            // 2. 调用 Firebase 的 requestPermission
            const authStatus = await this.messaging().requestPermission();
            // 1: AUTHORIZED, 2: PROVISIONAL
            return authStatus === 1 || authStatus === 2;
        } catch (error) {
            console.error("[requestPermission] failed:", error);
            return false;
        }
    }
}

const FirebaseProviderInstance = new FirebaseProvider();
export default FirebaseProviderInstance;
