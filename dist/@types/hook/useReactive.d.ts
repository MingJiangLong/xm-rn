/**
 * A React hook that creates a reactive value.
 * For objects, it returns a reactive proxy. For primitives, it wraps them in a reactive object.
 */
export declare function useReactive<T extends Record<string, any>>(initialValue: T): T;
export declare function useReactive<T>(initialValue: T): {
    value: T;
};
