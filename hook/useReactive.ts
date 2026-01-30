import { useCallback, useRef, useState } from "react";

/**
 * Performs a shallow equality check between two values.
 * Handles primitive values, objects, and arrays at the first level.
 */
function isShallowEqual(objA: any, objB: any): boolean {
    // Check if they are the same reference or primitive equality (Object.is handles NaN)
    if (Object.is(objA, objB)) {
        return true;
    }

    // If types differ or either is null, they are not equal
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
    }

    // Compare key lengths
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    // Compare keys and first-level values
    for (let i = 0; i < keysA.length; i++) {
        const currentKey = keysA[i];

        if (!Object.prototype.hasOwnProperty.call(objB, currentKey) || !Object.is(objA[currentKey], objB[currentKey])) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if a value can be proxied (i.e., is an object or array).
 */
function canBeProxy(value: any): value is Record<string, any> {
    return Object.prototype.toString.call(value) === '[object Object]' ||
        Object.prototype.toString.call(value) === '[object Array]';
}

/**
 * A React hook that creates a reactive object using Proxy.
 * Changes to the object's properties (including nested ones) will trigger component re-renders.
 *
 * @template T - The type of the initial value, must be an object.
 * @param initialValue - The initial object value to make reactive.
 * @returns A reactive proxy of the initial value.
 */
function useReactiveValue<T extends Record<string, any>>(initialValue: T): T {
    const [, forceUpdate] = useState(0);
    const dataRef = useRef(initialValue);
    const proxiedMapRef = useRef<WeakMap<any, any>>(new WeakMap());

    const triggerUpdate = useCallback(() => {
        forceUpdate(tick => tick + 1);
    }, []);

    const createNestedProxy = useCallback(
        (target: any) => {
            if (!canBeProxy(target)) return target;

            if (proxiedMapRef.current.has(target)) {
                return proxiedMapRef.current.get(target);
            }

            const proxiedData = new Proxy(target, {
                get(obj, prop, receiver) {
                    const ret = Reflect.get(obj, prop, receiver);
                    return createNestedProxy(ret);
                },
                set(obj, prop, value, receiver) {
                    const oldValue = Reflect.get(obj, prop);
                    if (isShallowEqual(oldValue, value)) return true;

                    const success = Reflect.set(obj, prop, value, receiver);
                    if (success) {
                        triggerUpdate();
                    }
                    return success;
                }
            });

            proxiedMapRef.current.set(target, proxiedData);
            return proxiedData;
        },
        [triggerUpdate]
    );

    if (!dataRef.current['__proxy_initialized__']) {
        dataRef.current = createNestedProxy(dataRef.current);
        Object.defineProperty(dataRef.current, '__proxy_initialized__', {
            value: true,
            enumerable: false,
            configurable: false
        });
    }

    return dataRef.current as T;
}

/**
 * A React hook that creates a reactive value.
 * For objects, it returns a reactive proxy. For primitives, it wraps them in a reactive object.
 *
 * @template T - The type of the initial value.
 * @param initialValue - The initial value to make reactive.
 * @returns A reactive value or object.
 */
export function useReactive<T extends Record<string, any>>(initialValue: T): T;
export function useReactive<T>(initialValue: T): { value: T };

export function useReactive<T>(initialValue: T) {
    if (typeof initialValue === 'object' && initialValue !== null) {
        return useReactiveValue(initialValue as Record<string, any>);
    } else {
        return useReactiveValue({ value: initialValue });
    }
}

