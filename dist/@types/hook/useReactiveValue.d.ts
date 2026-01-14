type I_ReactiveObject<T = any> = {
    value: T;
};
/** 暂时有一些问题 */
export declare function useReactiveValue<T>(target: T): I_ReactiveObject<T>;
export {};
