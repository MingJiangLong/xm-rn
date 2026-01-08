interface I_AppReviewModule {
    isAvailable: () => boolean;
    RequestInAppReview: () => Promise<boolean>;
    fetchMarketUrl: () => Promise<string>;
}
export declare const useAppReview: <T extends I_AppReviewModule>(appReview: T) => {
    openAppMarket: () => Promise<void>;
    openMarketSchema: () => Promise<[Error | null, void | null]>;
    openMarketUrl: (url: string) => Promise<[Error | null, void | null]>;
};
export {};
