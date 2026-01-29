/**
 * @param initialValue
 * @returns 响应式对象
 */
export declare function useReactiveValue<T extends object>(initialValue: T): T;
export declare function useReactive<T>(initialValue: T): {
    value: T;
};
