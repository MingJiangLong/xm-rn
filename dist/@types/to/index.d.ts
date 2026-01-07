/**
 *
 * @param fn
 *
 * @example
 *
 * async function test(){
 *    const [error,data] = await to(async() => {})()
 * }
 * @returns
 */
export declare function to<T extends (...args: any[]) => Promise<any>, E = Error>(fn: T): (...args: Parameters<T>) => Promise<[E | null, Awaited<ReturnType<T>> | null]>;
/** 要注意有些函数返回了null */
export declare function toSync<T extends (...args: any) => any, E = Error>(fn: T): (...args: Parameters<T>) => [E | null, ReturnType<T> | null];
