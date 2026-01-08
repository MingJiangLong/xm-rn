import { TimeoutError } from "../error";
import { TerminalLog } from "../terminal-log/log";


const terminalLog = new TerminalLog("[add-timeout] ")
/**
 * 给函数添加超时
 * @param input 需要添加的函数 有日志输入不要使用匿名函数
 * @param timeout  超时时间 默认3秒
 * @param timeoutMessage 超时消息
 * @returns 
 */
export function addTimeout<T extends (...args: any[]) => Promise<any>>(
    input: T,
    timeout = 3000,
    timeoutMessage?: string
) {

    return async (...args: Parameters<T>) => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
        const racePromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new TimeoutError(timeoutMessage)), timeout);
        });
        const operationPromise = input(...args);
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
            if (error instanceof TimeoutError) {
                terminalLog.warn(`函数${input.name}执行超时`);
            }
            throw error;
        }
    }
}




