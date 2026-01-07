

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
export function to<T extends (...args: any[]) => Promise<any>, E = Error>(
    fn: T
) {
    return async (...args: Parameters<T>): Promise<[E | null, Awaited<ReturnType<T>> | null]> => {
        try {
            const data: Awaited<ReturnType<T>> = await fn(...args);
            return [null, data];
        } catch (error) {
            return [error as E, null]
        }
    }
}

/** 要注意有些函数返回了null */
export function toSync<T extends (...args: any) => any, E = Error>(fn: T) {
    return (...args: Parameters<T>): [E | null, ReturnType<T> | null] => {
        try {
            const data = fn(...args);
            return [null, data]
        } catch (error) {
            return [error as E, null]
        }
    }
}