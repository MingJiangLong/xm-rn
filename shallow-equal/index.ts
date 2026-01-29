import { isPlainObject } from "../is/is-plain-object";
export function isShallowEqual(objA: any, objB: any): boolean {
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

export function isDeepEqual(value1: unknown, value2: unknown): boolean {

    if (isPlainObject(value1) && isPlainObject(value2)) {
        if (Object.keys(value1).length !== Object.keys(value2).length) return false;
        return Object.keys(value1).every(key => isDeepEqual(value1[key], value2[key]))
    }

    if (Array.isArray(value1) && Array.isArray(value2)) {
        if (value1.length !== value2.length) return false
        return value1.every((item, index) => isDeepEqual(item, value2[index]))
    }
    return Object.is(value1, value2)
}