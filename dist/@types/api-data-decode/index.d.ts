export declare const decryptApiResponse: (word: string, key: string) => any;
interface I_Map {
    [key: string]: string | I_Map;
}
/**
 *
 * @param value
 * @description
 * const parse = createApiResponseParseBuilder({"/a/b":{response:{code:"a",data:{a:"b"}}}})
 *
 * const data = parse(responseData,"/a/b")
 *
 * @returns
 */
export declare function createApiResponseParseBuilder<T extends Record<string, {
    request: Record<string, string>;
    response: Record<string, {
        code: string;
        data: I_Map;
    }>;
}>>(json: T): (key: string, root: string) => string;
/**
 * 替换value中可替换的键值对的键
 * @param value
 * @param callback
 * @returns
 */
export declare function replaceKeyInObjectAndArray<T = any>(value: T, callback: (key: string) => string): T;
export declare const ApiDataFormat: {
    decryptApiResponse: (word: string, key: string) => any;
    replaceKeyInObjectAndArray: typeof replaceKeyInObjectAndArray;
    createApiResponseParseBuilder: typeof createApiResponseParseBuilder;
};
export {};
