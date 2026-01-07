


import CryptoJS from 'crypto-js';

function getKey(key: string) {
    return CryptoJS.enc.Utf8.parse(key);
}

export const decryptApiResponse = (word: string, key: string) => {
    let base64 = CryptoJS.enc.Base64.parse(word.replace(/\s/g, ''));
    let src = CryptoJS.enc.Base64.stringify(base64);
    let decrypt = CryptoJS.AES.decrypt(src, getKey(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });

    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
};
interface I_Map {
    [key: string]: string | I_Map;
}
function recordMap(items: I_Map): Record<string, string> {
    return Object.entries(items).reduce((total, current) => {
        const [key, value] = current;
        if (typeof value == "string") {
            return {
                ...total,
                [value]: key
            }
        }
        return {
            ...total,
            ...recordMap(value as I_Map)
        }
    }, {} as Record<string, string>)
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
export function createApiResponseParseBuilder<T extends Record<string, {
    request: Record<string, string>
    response: Record<string, {
        code: string
        data: I_Map
    }>
}>>(json: T) {
    const pathKeys = Object.keys(json).filter(item => item.includes("/"));
    const cache = pathKeys.reduce((total, current) => {
        const currentMap = json[current]?.response;
        return {
            ...total,
            [current]: recordMap(currentMap)
        }
    }, {} as Record<string, Record<string, string>>)


    return (key: string, root: string) => {
        const findKey = Object.keys(cache).find(item => root.endsWith(item))
        if (!findKey) return key;
        const map = cache[findKey];
        return map[key] ?? key
    }
}


function isKV(value: any): value is { [k: string]: any } {
    return Object.prototype.toString.call(value) === '[object Object]';
}

function isArray(value: any): value is Array<any> {
    return Object.prototype.toString.call(value) === '[object Array]';
}



/**
 * 替换value中可替换的键值对的键
 * @param value 
 * @param callback 
 * @returns 
 */
export function replaceKeyInObjectAndArray<T = any>(value: T, callback: (key: string) => string): T {
    if (!isKV(value) && !isArray(value)) return value as T;
    if (isArray(value)) return value.map(item => replaceKeyInObjectAndArray(item, callback)) as T;
    return Object.keys(value).reduce<any>((total, key) => {
        return {
            ...total,
            [callback(key)]: replaceKeyInObjectAndArray(value[key], callback)
        }
    }, {})
}


export const ApiDataFormat = {
    decryptApiResponse,
    replaceKeyInObjectAndArray,
    createApiResponseParseBuilder
}
