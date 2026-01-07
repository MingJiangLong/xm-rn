export declare function addTimeout<T extends (...args: any[]) => Promise<any>>(input: T, timeout?: number, timeoutMessage?: string): (...args: Parameters<T>) => Promise<ReturnType<T>>;
