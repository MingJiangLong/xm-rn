import { addTimeout } from "../add-timeout"
import { NotAuthenticatedError } from "../error"


interface Options extends RequestInit {
    timeout?: number
}

/**
 * 增强fetch
 * 1. 添加超时功能
 * @param input 
 * @param init 
 * @returns 
 */
async function fetchEnhanced(
    input: string | Request,
    options: Options,
) {

    const { timeout = 3000, ...init } = options
    return addTimeout(fetch, timeout)(input, init)
}
export class ApiInfo {
    path: string
    desc: string
    constructor(path: string, desc: string) {
        this.path = path
        this.desc = desc
    }
}

export function createApis<T extends Record<string, string>>(apis: T, desc?: T) {
    return Object.keys(apis).reduce((
        total,
        pathKey
    ) => {
        const path = apis[pathKey]
        const apiDesc = desc?.[pathKey] ?? apis[pathKey];
        return {
            ...total,
            [pathKey]: new ApiInfo(path, apiDesc)
        }
    }, {} as Record<keyof T, ApiInfo>)

}

interface I_CreatePostFactoryOptions {
    host: string
    timeout?: number
    showLog?: boolean
    buildRequestDataFn?: () => Promise<Record<string, any>>
    buildHeaderFn?: () => Promise<Record<string, string>>
}


const buildEmptyObject = () => Promise.resolve({})

export async function createPostFactory(
    options: I_CreatePostFactoryOptions) {
    const {
        host,
        timeout,
        buildRequestDataFn = buildEmptyObject,
        buildHeaderFn = buildEmptyObject,
        showLog = false
    } = options;


    const requestDataWhenCreateFactory = await buildRequestDataFn();
    const headerWhenCreateFactory = await buildHeaderFn();

    return async function <R = unknown, D = unknown>(
        urlInfo: ApiInfo | string,
        data?: D,
        options?: {
            buildRequestDataFn?: () => Promise<Record<string, any>>
            buildHeaderFn?: () => Promise<Record<string, any>>
            responseInterceptor?: (response: any) => Promise<R>
        }
    ) {

        const isShowLog = showLog;

        let url = "";

        let api: ApiInfo;
        if (typeof urlInfo === "string") {
            api = new ApiInfo(urlInfo, "unknown api")
        } else {
            api = urlInfo
        }

        url = `${host}${api.path.startsWith("/") ? "" : "/"}${api.path}`

        if (isShowLog) {
            console.log(`[${api.desc}] 请求地址:`, url);
        }

        const tempRequestData2 = options?.buildRequestDataFn ? await options.buildRequestDataFn() : {};
        const tempRequestHeader2 = options?.buildHeaderFn ? await options.buildHeaderFn() : {};

        const requestData = {
            ...requestDataWhenCreateFactory,
            ...tempRequestData2,
            ...data,
        }

        if (isShowLog) {
            console.log(`[${api.desc}] 请求参数:`, JSON.stringify(requestData, null, 2));
        }
        const requestHeader = {
            ...headerWhenCreateFactory,
            ...tempRequestHeader2,
        }
        try {
            const response = await fetchEnhanced(
                url,
                {
                    body: JSON.stringify(requestData),
                    headers: requestHeader,
                    method: "POST"
                }
            )
            const responseDataTemp = await response.text();
            let responseData = responseDataTemp as any;

            if (options?.responseInterceptor) {
                responseData = await options.responseInterceptor(responseData);
            }
            try {
                const temp = JSON.parse(responseData);
                if (isShowLog) {
                    console.log(`[${api.desc}] 返回参数:`, JSON.stringify(temp, null, 2));
                }
                if (temp?.code == "-1") {
                    throw new NotAuthenticatedError();
                }
                return temp as R;
            } catch (error) {
                if (isShowLog) {
                    console.log(`[${api.desc}] 返回参数:`, "已收到返回内容可能过长截取前20位", responseData.slice(0, 20));
                }
                return responseData as R;
            }
        } catch (error) {
            if (isShowLog) {
                console.log(`[${api.desc}] 请求失败:`, JSON.stringify(error));
            }
            throw error;
        }
    }
}



