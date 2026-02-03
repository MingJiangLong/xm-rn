import { TimeoutError } from "../error";

/**
 * 为异步函数添加超时功能
 * @param input - 需要添加超时的异步函数
 * @param timeout - 超时时间（毫秒），默认为 3000ms
 * @param timeoutMessage - 自定义超时错误消息
 * @returns 返回包装后的函数，如果超时会抛出 TimeoutError
 *
 * @example
 * ```typescript
 * const fetchWithTimeout = addTimeout(fetchData, 5000, "数据获取超时");
 * const result = await fetchWithTimeout();
 * ```
 */
export function addTimeout<T extends (...args: unknown[]) => Promise<unknown>>(
    input: T,
    timeout = 3000,
    timeoutMessage?: string
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    // 参数验证
    if (timeout <= 0 || !Number.isFinite(timeout)) {
        throw new Error("Timeout must be a positive finite number");
    }

    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        // 创建超时 Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new TimeoutError(timeoutMessage));
            }, timeout);
        });

        try {
            // 使用 Promise.race 竞争超时和原操作
            const result = await Promise.race([timeoutPromise, input(...args)]);
            return result as Awaited<ReturnType<T>>;
        } finally {
            // 确保无论如何都清理定时器
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    };
}




