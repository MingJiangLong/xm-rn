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
export function toSync<T extends (...args: any) => any, E = Error>(fn: T) {
    return (...args: Parameters<T>): [E, null] | [null, ReturnType<T>] => {
        try {
            const data = fn(...args);
            return [null, data];
        } catch (error) {
            return [error as E, null];
        }
    };
}


// async function test() {

//     return new Promise<number>((resolve, reject) => {
//         setTimeout(() => {
//             resolve(1)
//         }, 1000);
//     })
// }

// async function test2() {

//     let [e, value] = await to(test())
// }