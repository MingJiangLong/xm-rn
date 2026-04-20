import { Linking, Platform } from "react-native"
import { to } from "../to"
type Module = {
    isAvailable: () => boolean
    RequestInAppReview: () => any
}

/**
 * 该模块会自动调用`react-native-in-app-review`包
 * 如果需要使用自定包需要主动注入
 * @param fetchSupermarketStr 
 * @returns 
 */
export const useAppReview = (
    fetchSupermarketStr: () => Promise<string>,
    customModule?: Module
) => {

    const getSdk = () => {
        let appReviewSdk: any = customModule
        if (appReviewSdk == undefined) {
            appReviewSdk = require("react-native-in-app-review").default;
        }
        if (!appReviewSdk) throw new Error("react-native-in-app-review not found");
        return appReviewSdk;
    }
    const openMarketUrl = to(
        async (url: string) => {
            const urlStr = `${url ?? ""}`
            await Linking.openURL(urlStr)
        }
    )
    const openMarketSchema = to(
        async () => {
            const appReviewSdk = getSdk()
            if (!appReviewSdk.isAvailable()) throw new Error("not supported app review")
            const result = await appReviewSdk.RequestInAppReview()
            if (result == false) throw new Error("not supported app review")
        }
    )


    const onFetchSupermarketStr = async () => {
        const [error, url] = await to(fetchSupermarketStr)()
        if (!url?.length) throw new Error("[app-review]: url is empty");
        if (!error) return url
        throw new Error(`[app-review]:获取市场连接失败 ${error}`)
    }
    const reviewWhenIos = async () => {
        const [error, url] = await to(onFetchSupermarketStr)();
        if (!error) {
            return await openMarketUrl(url ?? "");
        } else {
            console.warn(`[app-review]: 获取市场连接失败,即将打开商店`, error);
        }
        const [error2, rest] = await openMarketSchema();
        if (error2) {
            console.warn(`[app-review]: 打开商店失败`, error2);
        }
    }

    const reviewWhenAndroid = async () => {
        const [error,] = await openMarketSchema()
        if (!error) {
            console.warn(`[app-review]: 打开商店失败,即将打开链接`, error);
        };
        const [error2, url] = await to(onFetchSupermarketStr)();
        if (!error2) {
            return console.warn(`[app-review]: 打开链接失败`, error);
        }
        return await openMarketUrl(url ?? "")
    }


    const openAppMarket = async () => {
        const callback = Platform.select({
            android: reviewWhenAndroid,
            ios: reviewWhenIos
        })
        if (!callback) return;
        callback()
    }
    return {
        openAppMarket,
        openMarketSchema,
        openMarketUrl
    }
}


