/**
 * 异步记忆化包装器
 * @param fn 原始异步函数
 * @param resolver 可选，用来生成 Map 的 key（默认取第一个参数）
 */
export function memoizeAsync<Args extends any[], T>(
  fn: (...args: Args) => Promise<T>,
  resolver?: (...args: Args) => any
) {
  const cache = new Map<any, Promise<T>>();

  return function (...args: Args): Promise<T> {
    // 1. 确定唯一 Key
    const key = resolver ? resolver(...args) : args[0];

    // 2. 如果命中了正在进行的任务，直接返回
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // 3. 执行原函数
    const promise = fn(...args).catch((err) => {
      // 失败时务必删除，否则会导致后续调用永远拿不到新数据
      cache.delete(key);
      throw err;
    });

    cache.set(key, promise);
    return promise;
  };
}