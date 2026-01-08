export function isArray(value: any): value is Array<any> {
    return Object.prototype.toString.call(value) === '[object Array]'
}