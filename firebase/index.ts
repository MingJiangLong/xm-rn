import { Platform, PermissionsAndroid } from "react-native";
import { to } from "../to";

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


    getAnalyticsId = async () => {
        if (!this.analytics) {
            console.log('[Firebase] analytics module not injected');
            return null;
        }

        const [error, instanceId] = await to(this.analytics().getAppInstanceId())
        if (error) {
            console.warn('[getAnalyticsId] failed', error.message);
            return null
        };
        return instanceId
    }

    getToken = async () => {
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

    getTokenAndAnalyticsId = async () => {
        const [token, analyticsId] = await Promise.all([
            this.getToken().catch(() => null),
            this.getAnalyticsId().catch(() => null),
        ]);

        const result: { deviceToken?: string; appInstanceId?: string } = {};
        if (token) result.deviceToken = token;
        if (analyticsId) result.appInstanceId = analyticsId;

        return Object.keys(result).length > 0 ? result : null;
    }

    requestNotificationPermission = async (): Promise<boolean> => {
        if (!this.messaging) {
            console.log('[Firebase] messaging module not injected');
            return false;
        }

        try {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    return false;
                }
            }

            const authStatus = await this.messaging().requestPermission();
            return authStatus === 1 || authStatus === 2;
        } catch (error) {
            console.error("[requestPermission] failed:", error);
            return false;
        }
    }
}

const FirebaseProviderInstance = new FirebaseProvider();
export default FirebaseProviderInstance;
