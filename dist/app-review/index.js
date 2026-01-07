"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppReview = void 0;
const react_native_1 = require("react-native");
const to_1 = require("../to");
const useAppReview = (appReview) => {
    const openMarketUrl = (0, to_1.to)((url) => __awaiter(void 0, void 0, void 0, function* () {
        const urlStr = `${url !== null && url !== void 0 ? url : ""}`;
        if (urlStr.length == 0)
            throw new Error("url is empty");
        yield react_native_1.Linking.openURL(urlStr);
    }));
    const openMarketSchema = (0, to_1.to)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!appReview.isAvailable())
            throw new Error("not supported app review");
        const result = yield appReview.RequestInAppReview();
        if (result == false)
            throw new Error("not supported app review");
    }));
    const reviewWhenIos = (fetchSupermarketStr) => __awaiter(void 0, void 0, void 0, function* () {
        const [error1, url] = yield fetchSupermarketStr();
        if (error1) {
            console.error(`[app-review] 获取市场连接失败`, error1);
            return;
        }
        ;
        const [error,] = yield openMarketUrl(url);
        if (!error)
            return;
        yield openMarketSchema();
    });
    const reviewWhenAndroid = (fetchSupermarketStr) => __awaiter(void 0, void 0, void 0, function* () {
        const [error,] = yield openMarketSchema();
        if (!error)
            return;
        const [error1, url] = yield fetchSupermarketStr();
        if (error1)
            return;
        yield openMarketUrl(url);
    });
    const openAppMarket = () => __awaiter(void 0, void 0, void 0, function* () {
        const callback = react_native_1.Platform.select({
            android: reviewWhenAndroid,
            ios: reviewWhenIos
        });
        if (!callback)
            return;
        callback(appReview.fetchMarketUrl);
    });
    return {
        openAppMarket,
        openMarketSchema,
        openMarketUrl
    };
};
exports.useAppReview = useAppReview;
