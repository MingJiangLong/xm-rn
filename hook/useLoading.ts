import { useCallback, useState } from "react";

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
export function useLoading<T extends AsyncFn>(asyncFn: T) {
    const [loading, setLoading] = useState(false);

    /**
     * Executes the async function with the provided arguments, managing the loading state.
     * The loading state is set to true before execution and false after completion (or error).
     *
     * @param args - Arguments to pass to the async function.
     * @returns The result of the async function.
     */
    const execute = useCallback(
        async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
            setLoading(true);
            try {
                const data = await asyncFn(...args);
                return data
            } finally {
                setLoading(false);
            }
        },
        [asyncFn]
    );

    return { loading, execute };
}