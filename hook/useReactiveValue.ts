import { useCallback, useRef, useState } from "react";
function isShallowEqual(objA: any, objB: any): boolean {
    // 1. 检查是否是同一个引用地址，或者两个原始值是否严格相等（Object.is 处理了 NaN 的特殊情况）
    if (Object.is(objA, objB)) {
        return true;
    }

    // 2. 如果类型不同、或者有一个是 null，那么它们不相等
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
    }

    // 3. 获取并比较键的数量
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    // 4. 遍历键并进行第一层的值比较
    for (let i = 0; i < keysA.length; i++) {
        const currentKey = keysA[i];

        // 确保 objB 拥有相同的键，并且使用 Object.is() 比较它们的值（仅限第一层）。
        if (!Object.prototype.hasOwnProperty.call(objB, currentKey) || !Object.is(objA[currentKey], objB[currentKey])) {
            return false;
        }
    }

    // 所有检查都通过，对象浅层相等
    return true;
}
function canBeProxy(value: any): value is Record<string, any> {
    return (Object.prototype.toString.call(value) === '[object Object]' || Object.prototype.toString.call(value) === '[object Array]');
}

/**
 * @param initialValue 
 * @returns 响应式对象
 */
export function useReactiveValue<T extends object>(initialValue: T): T {
    const [, forceUpdate] = useState(0);
    const dataRef = useRef(initialValue);
    const proxiedMapRef = useRef<WeakMap<any, any>>(new WeakMap()).current;
    const triggerUpdate = useCallback(() => {
        forceUpdate(tick => tick + 1);
    }, []);

    const createNestedProxy = useCallback(
        (target: any) => {
            if (!canBeProxy(target)) return target;
            if (proxiedMapRef.has(target)) {
                return proxiedMapRef.get(target);
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
                    return success
                }
            });
            proxiedMapRef.set(target, proxiedData);
            return proxiedData;
        },
        [proxiedMapRef, triggerUpdate] // 依赖项稳定
    );

    // @ts-ignore
    if (!dataRef.current['__proxy_initialized__']) {
        dataRef.current = createNestedProxy(dataRef.current);
        Object.defineProperty(dataRef.current, '__proxy_initialized__', { value: true, enumerable: false });
    }

    return dataRef.current as T;
}


export function useReactive<T>(initialValue: T) {
    return useReactiveValue({ value: initialValue })
}
