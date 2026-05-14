export function to<T, E = Error>(input: Promise<T>): Promise<[null, T] | [E, null]>;

export async function to<T, E = Error>(
    input: Promise<T>
): Promise<[null, T] | [E, null]> {
    try {
        const data = await input;
        return [null, data];
    } catch (err) {
        return [err as E, null];
    }
}

export function toSync<T, E = Error>(input: () => T): [null, T] | [E, null];
export function toSync<T, E = Error>(input: () => T): [null, T] | [E, null] {
    try {
        const data = input();
        return [null, data];
    } catch (err) {
        return [err as E, null];
    }
}

/**
 * 顺序执行多个同步函数，并统一返回 [error, data] 数组
 * 支持多元组类型推导，保持输入与输出的类型严格对应
 */
export function allSync<T extends (() => any)[], E = Error>(
    tasks: [...T]
): { [K in keyof T]: T[K] extends () => infer R ? [null, R] | [E, null] : never };

export function allSync<T, E = Error>(
    tasks: (() => T)[]
): ([null, T] | [E, null])[];

// 函数实体实现
export function allSync<E = Error>(tasks: (() => any)[]): any[] {
    return tasks.map(task => toSync<any, E>(task));
}