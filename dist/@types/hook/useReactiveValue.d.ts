type I_ReactiveObject<T = any> = {
    value: T;
};
export declare function useReactiveValue<T>(target: T): I_ReactiveObject<T>;
export {};
