import { TimeoutError } from "../error";

export function addTimeout<T extends (...args: any[]) => Promise<any>>(
    input: T,
    timeout = 3000,
    timeoutMessage?: string
): T {
    return (async (...args: Parameters<T>): Promise<any> => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        const timeoutPromise = new Promise((_s, reject) => {
            timer = setTimeout(() => reject(new TimeoutError(timeoutMessage ?? "Timeout")), timeout)
        });
        return Promise.race([input(...args), timeoutPromise]).finally(() => {
            if (timer) {
                clearTimeout(timer);
                timer = null
            }
        })
    }) as unknown as T;
}