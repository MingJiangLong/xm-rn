/**
 * 给函数添加超时
 * @param input 需要添加的函数 有日志输入不要使用匿名函数
 * @param timeout  超时时间 默认3秒
 * @param timeoutMessage 超时消息
 * @returns
 */
export declare function addTimeout<T extends (...args: any[]) => Promise<any>>(input: T, timeout?: number, timeoutMessage?: string): (...args: Parameters<T>) => Promise<ReturnType<T>>;
