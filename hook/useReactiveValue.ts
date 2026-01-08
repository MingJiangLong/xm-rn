import { useCallback, useMemo, useRef, useState } from "react";


type I_ReactiveObject<T = any> = {
    value: T
}
function canBeProxy(value: any): value is Record<string, any> {
    return typeof value === 'object' && value !== null;
}

export function useReactiveValue<T>(target: T) {
    const [state, setState] = useState<I_ReactiveObject<T>>({ value: target });
    const proxiedMap = useRef<WeakMap<any, any>>(new WeakMap()).current;
    const addNestedProxy: (...args: any[]) => I_ReactiveObject<T> = useCallback(
        (data: any) => {
            if (!canBeProxy(data)) return data;
            if (proxiedMap.has(data)) {
                return proxiedMap.get(data);
            }
            const ret = new Proxy(data, {
                get(obj, prop) {
                    const ret = Reflect.get(obj, prop)
                    return addNestedProxy(ret);
                },
                set(obj, prop, value) {

                    const oldValue = Reflect.get(obj, prop);
                    if (oldValue === value) return true

                    const success = Reflect.set(obj, prop, value);
                    if (success) setState({ ...state })
                    return true;
                }
            });
            proxiedMap.set(data, ret);
            return ret;
        }, [])
    return useMemo(() => {
        return addNestedProxy(state)
    }, [state])
}





