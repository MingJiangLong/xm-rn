import { TimeoutError } from "../error";

export function addTimeout<T extends (...args: any[]) => Promise<any>>(
    input: T,
    timeout = 3000,
    timeoutMessage?: string
) {

    return async (...args: Parameters<T>) => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new TimeoutError(timeoutMessage)), timeout);
        });
        const operationPromise = input(...args);
        const racePromise = Promise.race([operationPromise, timeoutPromise]);

        try {
            const result = await Promise.race([racePromise, operationPromise]);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            return result as Awaited<ReturnType<T>>;
        } catch (error) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            throw error;
        }
    }
}


