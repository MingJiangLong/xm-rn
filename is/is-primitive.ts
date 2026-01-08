
export type I_PrimitiveValue = string | number | boolean | symbol | undefined | null | BigInt
export function isPrimitive<T = I_PrimitiveValue>(value: any): value is T {
    return typeof value != "object" || value === null;
}


export function isString(value: unknown): value is string {
    return typeof value === 'string';
}
export function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}
export function isSymbol(value: unknown): value is symbol {
    return typeof value === 'symbol';
}
export function isUndefined(value: unknown): value is undefined {
    return typeof value === 'undefined';
}
export function isNull(value: unknown): value is null {
    return value === null;
}
export function isBigInt(value: unknown): value is BigInt {
    return typeof value === 'bigint';
}
export function isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}
