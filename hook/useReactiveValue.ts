import { useCallback, useMemo, useRef, useState } from "react";
import { isShallowEqual } from "../shallow-equal";


type I_ReactiveObject<T = any> = {
    value: T
}
function canBeProxy(value: any): value is Record<string, any> {
    return (Object.prototype.toString.call(value) === '[object Object]' || Object.prototype.toString.call(value) === '[object Array]');
}

/** 暂时有一些问题 */
export function useReactiveValue<T>(target: T) {
    const [state, setState] = useState<I_ReactiveObject<T>>({ value: target });
    const proxiedMap = useRef<WeakMap<any, any>>(new WeakMap()).current;

    const addNestedProxy: (...args: any[]) => I_ReactiveObject<T> = useCallback(
        (data: any) => {
            if (!canBeProxy(data)) return data;
            if (proxiedMap.has(data)) {
                return proxiedMap.get(data);
            }
            const proxiedData = new Proxy(data, {
                get(obj, prop) {
                    const ret = Reflect.get(obj, prop)
                    return addNestedProxy(ret);
                },
                set(obj, prop, value) {
                    const oldValue = Reflect.get(obj, prop);
                    if (isShallowEqual(oldValue, value)) return true
                    const success = Reflect.set(obj, prop, value);

                    if (success) setState((prevState) => ({ value: prevState.value }));;
                    return true;
                }
            });
            proxiedMap.set(data, proxiedData);
            return proxiedData;
        }, [])


    // state变化之后无需重新创建proxy

    return useMemo(() => {
        return addNestedProxy(state)
    }, [])
}





