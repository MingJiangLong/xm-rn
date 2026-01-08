import { Linking, Platform } from "react-native"
import { to } from "../to"
import { TerminalLog } from "../terminal-log/log"



const terminal = new TerminalLog("[app-review] ")
interface I_AppReviewModule {
    isAvailable: () => boolean
    RequestInAppReview: () => Promise<boolean>
    fetchMarketUrl: () => Promise<string>
}

export const useAppReview = <T extends I_AppReviewModule>(appReview: T) => {
    const openMarketUrl = to(
        async (url: string) => {
            const urlStr = `${url ?? ""}`
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
        const [error, url] = await to(fetchSupermarketStr)();
        if (!!url) {
            return await openMarketUrl(url);
        }
        terminal.info("获取市场连接失败,切换为打开应用市场", error)

        const [error1] = await openMarketSchema();
        terminal.error("打开应用市场失败", error1)
    }

    const reviewWhenAndroid = async (fetchSupermarketStr: () => Promise<string>) => {
        const [error,] = await openMarketSchema()
        if (!error) return;
        terminal.info("打开应用市场失败,切换为打开市场连接", error)
        const [error2, url] = await to(fetchSupermarketStr)();
        if (!url || error2) {
            return terminal.info("获取市场连接失败", error)
        }
        return await openMarketUrl(url)
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


