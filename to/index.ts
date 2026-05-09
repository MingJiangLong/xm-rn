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