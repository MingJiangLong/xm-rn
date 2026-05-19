import { Linking, Platform } from "react-native"
import { to } from "../to"



interface I_AppReviewModule {
    isAvailable: (...args: any[]) => boolean
    RequestInAppReview: (...args: any[]) => Promise<boolean>
}


class AppReviewProvider {
    private module: I_AppReviewModule | null = null;

    constructor() {
        this.module = null;
    }

    init<T extends I_AppReviewModule>(module: T) {
        this.module = module;
    }



    private getModule() {
        if (!this.module) {
            throw new Error('[AppReviewProvider] Module not injected');
        }
        return this.module;
    }
    private openMarketUrl = async (url: string) => {
        const urlStr = `${url ?? ""}`;
        if (!urlStr) return;
        await Linking.openURL(urlStr);

    };

    private openMarketSchema = async (): Promise<boolean> => {
        const module = this.getModule();
        return module.RequestInAppReview();

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
        const callback = Platform.select({
            android: () => this.reviewWhenAndroid(fetchUrl ?? (() => Promise.resolve(""))),
            ios: () => this.reviewWhenIos(fetchUrl ?? (() => Promise.resolve("")))
        });

        if (callback) {
            await callback();
        }
    }
}

const AppReviewProviderInstance = new AppReviewProvider();
export default AppReviewProviderInstance;

