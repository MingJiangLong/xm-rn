import { Linking, Platform } from "react-native"
import { to } from "../to"

interface I_AppReviewModule {
    isAvailable: () => boolean
    RequestInAppReview: () => Promise<boolean>
    fetchMarketUrl: () => Promise<string>
}

export const useAppReview = <T extends I_AppReviewModule>(appReview: T) => {
    const openMarketUrl = to(
        async (url?: string) => {
            const urlStr = `${url ?? ""}`
            if (urlStr.length == 0) throw new Error("url is empty");
            await Linking.openURL(urlStr)
        }
    )
    const openMarketSchema = to(
        async () => {
            if (!appReview.isAvailable()) throw new Error("not supported app review")
            const result = await appReview.RequestInAppReview()
            if (result == false) throw new Error("not supported app review")
        }
    )
    const reviewWhenIos = async (fetchSupermarketStr: () => Promise<string>) => {
        const [error1, url] = await to(fetchSupermarketStr)();
        if (error1 || !url) {
            console.error(`[app-review] 获取市场连接失败`, error1);
            return
        };
        const [error,] = await openMarketUrl(url)
        if (!error) return;
        await openMarketSchema()
    }

    const reviewWhenAndroid = async (fetchSupermarketStr: () => Promise<string>) => {
        const [error,] = await openMarketSchema()
        if (!error) return;
        const [error1, url] = await to(fetchSupermarketStr)();
        if (error1 || !url) return;
        await openMarketUrl(url)
    }


    const openAppMarket = async () => {
        const callback = Platform.select({
            android: reviewWhenAndroid,
            ios: reviewWhenIos
        })
        if (!callback) return;
        callback(appReview.fetchMarketUrl)
    }

    return {
        openAppMarket,
        openMarketSchema,
        openMarketUrl
    }
}


