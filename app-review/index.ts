import { Linking, Platform } from "react-native"
import { to } from "../to"



interface I_AppReviewModule {
    isAvailable: (...args: any[]) => boolean
    RequestInAppReview: (...args: any[]) => Promise<boolean>
}


class AppReviewSDK {
    private module: I_AppReviewModule | null = null;

    constructor() {
        this.module = null;
    }

    init<T extends I_AppReviewModule>(module: T) {
        this.module = module;
    }

    private isReady(): boolean {
        return !!(this.module && typeof this.module.isAvailable === 'function');
    }
    private openMarketUrl = async (url: string) => {
        const urlStr = `${url ?? ""}`;
        if (!urlStr) return;
        try {
            await Linking.openURL(urlStr);
        } catch (e) {
            console.error("Linking.openURL failed", e);
        }
    };

    private openMarketSchema = async (): Promise<boolean> => {
        if (!this.isReady() || !this.module?.isAvailable()) {
            return false;
        }
        try {
            return await this.module.RequestInAppReview();
        } catch (e) {
            return false;
        }
    };

    private async reviewWhenIos(fetchUrl: () => Promise<string>) {

        const [_error, url] = await to(fetchUrl());
        if (url && url.length > 0) {
            return await this.openMarketUrl(url);
        }
        await this.openMarketSchema();
    }

    private async reviewWhenAndroid(fetchUrl: () => Promise<string>) {
        const success = await this.openMarketSchema();
        if (success) return;
        const [_error, url] = await to(fetchUrl());
        if (url && url.length > 0) {
            await this.openMarketUrl(url);
        }
    }


    async openAppMarket(fetchUrl?: () => Promise<string>) {
        if (!this.isReady()) {
            return console.error("AppReview module not injected");
        }
        const callback = Platform.select({
            android: () => this.reviewWhenAndroid(fetchUrl ?? (() => Promise.resolve(""))),
            ios: () => this.reviewWhenIos(fetchUrl ?? (() => Promise.resolve("")))
        });

        if (callback) {
            await callback();
        }
    }
}

const AppReviewProviderInstance = new AppReviewSDK();
export default AppReviewProviderInstance;

