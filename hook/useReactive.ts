import { useCallback, useRef, useState } from "react";

/**
 * Performs a shallow equality check between two values.
 * Handles primitive values, objects, and arrays at the first level.
 */
function isShallowEqual(objA: any, objB: any): boolean {
    if (Object.is(objA, objB)) return true;
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) return false;

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
            return false;
        }
    }
    return true;
}

/**
 * Checks if a value can be proxied (i.e., is an object or array).
 */
function canBeProxy(value: any): value is Record<string, any> {
    const type = Object.prototype.toString.call(value);
    return type === '[object Object]' || type === '[object Array]';
}

/**
 * A React hook that creates a reactive object using Proxy.
 * Changes to the object's properties (including nested ones) will trigger component re-renders.
 */
function useReactiveValue<T extends Record<string, any>>(initialValue: T): T {
    const [, forceUpdate] = useState(0);
    const proxiedMapRef = useRef<WeakMap<any, any>>(new WeakMap());

    const triggerUpdate = useCallback(() => {
        forceUpdate(prev => prev + 1);
    }, []);

    const createNestedProxy = useCallback(
        (target: any): any => {
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
                    if (success) triggerUpdate();
                    return success;
                },
                deleteProperty(obj, prop) {
                    const success = Reflect.deleteProperty(obj, prop);
                    if (success) triggerUpdate();
                    return success;
                }
            });

            proxiedMapRef.current.set(target, proxiedData);
            return proxiedData;
        },
        [triggerUpdate]
    );

    const reactiveValue = useRef(createNestedProxy(initialValue));

    return reactiveValue.current as T;
}

/**
 * A React hook that creates a reactive value.
 * For objects, it returns a reactive proxy. For primitives, it wraps them in a reactive object.
 */
export function useReactive<T extends Record<string, any>>(initialValue: T): T;
export function useReactive<T>(initialValue: T): { value: T };

export function useReactive<T>(initialValue: T) {
    if (canBeProxy(initialValue)) {
        return useReactiveValue(initialValue);
    } else {
        return useReactiveValue({ value: initialValue } as any);
    }
}

