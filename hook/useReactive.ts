import { useCallback, useRef, useState } from "react";
declare const queueMicrotask: (fn: () => void) => void;

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


function canBeProxy(value: any): value is Record<string, any> {
    const type = Object.prototype.toString.call(value);
    return (
        type === '[object Object]' ||
        type === '[object Array]' ||
        type === '[object Map]' ||
        type === '[object Set]'
    );
}

function createCollectionHandlers(
    target: Map<any, any> | Set<any>,
    createNestedProxy: (val: any) => any,
    triggerUpdate: () => void
) {
    const isMap = target instanceof Map;

    // 自定义方法包装字典
    const instrumentations: Record<string, any> = {
        get(key: any) {
            const rawTarget = proxiedMapInverse.get(this) || target;
            const res = (rawTarget as Map<any, any>).get(key);
            return createNestedProxy(res);
        },
        add(value: any) {
            const rawTarget = (proxiedMapInverse.get(this) || target) as Set<any>;
            const hasValue = rawTarget.has(value);
            if (!hasValue) {
                rawTarget.add(value);
                triggerUpdate();
            }
            return this;
        },
        set(key: any, value: any) {
            const rawTarget = (proxiedMapInverse.get(this) || target) as Map<any, any>;
            const oldValue = rawTarget.get(key);
            if (!isShallowEqual(oldValue, value)) {
                rawTarget.set(key, value);
                triggerUpdate();
            }
            return this;
        },
        delete(key: any) {
            const rawTarget = proxiedMapInverse.get(this) || target;
            const hasKey = rawTarget.has(key);
            const success = rawTarget.delete(key);
            if (hasKey && success) {
                triggerUpdate();
            }
            return success;
        },
        clear() {
            const rawTarget = proxiedMapInverse.get(this) || target;
            const hadItems = rawTarget.size > 0;
            rawTarget.clear();
            if (hadItems) {
                triggerUpdate();
            }
        },
        forEach(callback: any, thisArg: any) {
            const rawTarget = proxiedMapInverse.get(this) || target;
            rawTarget.forEach((val: any, key: any) => {
                callback.call(thisArg, createNestedProxy(val), createNestedProxy(key), this);
            });
        },
        // 处理迭代器属性
        [Symbol.iterator]() {
            return this.entries();
        },
        entries() {
            const rawTarget = proxiedMapInverse.get(this) || target;
            const iterator = rawTarget.entries();
            return {
                next() {
                    const { value, done } = iterator.next();
                    return done
                        ? { value, done }
                        : { value: [createNestedProxy(value[0]), createNestedProxy(value[1])], done };
                },
                [Symbol.iterator]() { return this; }
            };
        },
        values() {
            const rawTarget = proxiedMapInverse.get(this) || target;
            const iterator = rawTarget.values();
            return {
                next() {
                    const { value, done } = iterator.next();
                    return done ? { value, done } : { value: createNestedProxy(value), done };
                },
                [Symbol.iterator]() { return this; }
            };
        },
        keys() {
            const rawTarget = proxiedMapInverse.get(this) || target;
            const iterator = rawTarget.keys();
            return {
                next() {
                    const { value, done } = iterator.next();
                    return done ? { value, done } : { value: createNestedProxy(value), done };
                },
                [Symbol.iterator]() { return this; }
            };
        }
    };

    return {
        get(obj: any, prop: string | symbol, receiver: any) {
            // 如果读取的是 size 属性，绑定回原始 Map/Set 作用域
            if (prop === 'size') {
                return Reflect.get(obj, prop, obj);
            }
            // 如果读取的方法在重写字典中存在，则返回中转后的劫持方法
            if (Object.prototype.hasOwnProperty.call(instrumentations, prop)) {
                return instrumentations[prop as string].bind(receiver);
            }
            const value = Reflect.get(obj, prop, obj);
            return typeof value === 'function' ? value.bind(obj) : value;
        }
    };
}

// 逆向关系映射，帮助 Map/Set 方法获取原始 target
const proxiedMapInverse = new WeakMap<any, any>();

function useReactiveValue<T extends Record<string, any>>(initialValue: T): T {
    const [, forceUpdate] = useState(0);

    // 1. 【核心改进】：微任务批处理更新队列
    // 杜绝数组 push 操作、连续多次赋值引起的 React 多次、重复强制渲染
    const isUpdatingRef = useRef(false);
    const triggerUpdate = useCallback(() => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;

        // 放入微任务队列，等当前宏任务中所有的同步修改全部完成后，合并执行一次组件刷新
        queueMicrotask(() => {
            forceUpdate((prev) => prev + 1);
            isUpdatingRef.current = false;
        });
    }, []);

    const proxiedMapRef = useRef<WeakMap<any, any>>(new WeakMap());

    // 使用 Ref 动态维持最新的渲染通知器，防止闭包过时缺陷
    const triggerUpdateRef = useRef(triggerUpdate);
    triggerUpdateRef.current = triggerUpdate;

    const createNestedProxy = useCallback((target: any): any => {
        if (!canBeProxy(target)) return target;
        if (proxiedMapRef.current.has(target)) {
            return proxiedMapRef.current.get(target);
        }

        let handler: ProxyHandler<any>;
        const type = Object.prototype.toString.call(target);

        // 2. 【核心改进】：区分处理普通 Object/Array 与 集合类 Map/Set
        if (type === '[object Map]' || type === '[object Set]') {
            handler = createCollectionHandlers(target, createNestedProxy, () => triggerUpdateRef.current());
        } else {
            handler = {
                get(obj, prop, receiver) {
                    const ret = Reflect.get(obj, prop, receiver);
                    return createNestedProxy(ret);
                },
                set(obj, prop, value, receiver) {
                    const oldValue = Reflect.get(obj, prop, receiver);
                    if (isShallowEqual(oldValue, value)) return true;

                    // 移除第四个参数 receiver 陷阱，防止复杂原型继承或嵌套下数据写错位置
                    const success = Reflect.set(obj, prop, value);
                    if (success) {
                        triggerUpdateRef.current();
                    }
                    return success;
                },
                deleteProperty(obj, prop) {
                    const success = Reflect.deleteProperty(obj, prop);
                    if (success) {
                        triggerUpdateRef.current();
                    }
                    return success;
                }
            };
        }

        const proxiedData = new Proxy(target, handler);
        proxiedMapRef.current.set(target, proxiedData);
        proxiedMapInverse.set(proxiedData, target); // 建立反向索引供集合类函数调取

        return proxiedData;
    }, []);

    const reactiveValue = useRef<any>(null);
    if (!reactiveValue.current) {
        reactiveValue.current = createNestedProxy(initialValue);
    }

    return reactiveValue.current as T;
}

export function useReactive<T extends Record<string, any>>(initialValue: T): T;
export function useReactive<T>(initialValue: T): { value: T };
export function useReactive<T>(initialValue: T) {
    if (canBeProxy(initialValue)) {
        return useReactiveValue(initialValue);
    } else {
        return useReactiveValue({ value: initialValue } as any);
    }
}
