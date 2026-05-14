
export function memoizeAsync<Args extends any[], T>(
  fn: (...args: Args) => Promise<T>,
  resolver?: (...args: Args) => any
) {
  const cache = new Map<any, Promise<T>>();
  const INTERNAL_DEFAULT_KEY = Symbol('MEMOIZE_ASYNC_DEFAULT_KEY');
  return function (...args: Args): Promise<T> {
    const key = resolver ? resolver(...args) : INTERNAL_DEFAULT_KEY;
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = fn(...args).catch((err) => {
      cache.delete(key);
      throw err;
    });

    cache.set(key, promise);
    return promise;
  };
}
