/**
 * A generic type for asynchronous functions that accept any arguments and return a Promise of any type.
 */
type AsyncFn = (...args: any[]) => Promise<any>;
/**
 * A React hook for managing loading state during asynchronous operations.
 * It executes the provided async function and tracks the loading state.
 *
 * @template T - The type of the async function, constrained to AsyncFn.
 * @param asyncFn - The asynchronous function to execute.
 * @returns An object containing the loading state and the execute function.
 */
export declare function useLoading<T extends AsyncFn>(asyncFn: T): {
    loading: boolean;
    execute: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
};
export {};
