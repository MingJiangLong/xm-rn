export interface I_LocationInfo {
    latitude: number;
    longitude: number;
    is_current: boolean;
}
type I_LocationBasic = {
    setRNConfiguration: (...args: any[]) => void;
    getCurrentPosition: (...args: any[]) => void;
};
export declare const useLocation: <T extends I_LocationBasic>(module: T) => {
    getCurrentPosition: () => Promise<Promise<I_LocationInfo>>;
    getCurrentPositionDetail: () => Promise<Promise<{
        city: string;
        state: string;
        country: string;
        postcode: string;
        province?: string;
    }>>;
};
export {};
