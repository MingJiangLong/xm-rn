import { isPlainObject } from "../is/is-plain-object";
export function isShallowEqual(value1: unknown, value2: unknown): boolean {

    if (isPlainObject(value1) && isPlainObject(value2)) {
        if (Object.keys(value1).length !== Object.keys(value2).length) return false;
        return Object.keys(value1).every(key => isShallowEqual(value1[key], value2[key]))
    }

    if (Array.isArray(value1) && Array.isArray(value2)) {
        if (value1.length !== value2.length) return false
        return value1.every((item, index) => isShallowEqual(item, value2[index]))
    }
    return value1 == value2
}