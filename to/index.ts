

/**
 * 将异步函数包装为返回 [error, data] 格式的函数
 * @param fn - 要包装的异步函数
 * @returns 返回一个函数，调用时返回 [Error | null, Data | null]
 *
 * @example
 * ```typescript
 * const [error, data] = await to(async () => fetchData())();
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log(data);
 * }
 * ```
 */
export function to<T extends (...args: any[]) => Promise<unknown>, E = Error>(
    fn: T
): (...args: Parameters<T>) => Promise<[E | null, Awaited<ReturnType<T>> | null]> {
    return async (...args: Parameters<T>): Promise<[E | null, Awaited<ReturnType<T>> | null]> => {
        try {
            const data = await fn(...args);
            return [null, data as Awaited<ReturnType<T>>];
        } catch (error) {
            return [error as E, null];
        }
    };
}

/**
 * 将同步函数包装为返回 [error, data] 格式的函数
 * 注意：如果原函数返回 null，data 也将为 null
 * @param fn - 要包装的同步函数
 * @returns 返回一个函数，调用时返回 [Error | null, Data | null]
 *
 * @example
 * ```typescript
 * const [error, data] = toSync(() => parseJson(str))();
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log(data);
 * }
 * ```
 */
export function toSync<T extends (...args: unknown[]) => unknown, E = unknown>(
    fn: T
): (...args: Parameters<T>) => [E | null, ReturnType<T> | null] {
    return (...args: Parameters<T>): [E | null, ReturnType<T> | null] => {
        try {
            const data = fn(...args);
            return [null, data as ReturnType<T>];
        } catch (error) {
            return [error as E, null];
        }
    };
}