

export type I_PlainObject = Record<string, any>
export function isPlainObject(value: any): value is I_PlainObject {
    return (
        typeof value === 'object' &&
        value !== null &&
        Object.prototype.toString.call(value) === '[object Object]' &&
        value.constructor === Object
    )
}