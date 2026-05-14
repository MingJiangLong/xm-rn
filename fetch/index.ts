import { NotAuthenticatedError } from "../error";
class ApiLogger {
    private startTime: number = 0;
    constructor(private desc: string, private showLog: boolean) {
        if (this.showLog) this.startTime = Date.now();
    }
    logRequest(url: string, data: any) {
        if (!this.showLog) return;
        console.log(
            `%c >> REQ [${this.desc}] %c ${new Date().toLocaleTimeString()}`,
            "background: #409EFF; color: white; padding: 2px 5px; border-radius: 3px;",
            "color: #909399; font-size: 10px;",
            { url, data }
        );
    }
    logResponse(data: any) {
        if (!this.showLog) return;
        const duration = Date.now() - this.startTime;
        console.log(
            `%c << RES [${this.desc}] %c +${duration}ms`,
            "background: #67C23A; color: white; padding: 2px 5px; border-radius: 3px;",
            "color: #909399; font-size: 10px;",
            { data }
        );
    }
    logError(error: any) {
        if (!this.showLog) return;
        const duration = Date.now() - this.startTime;
        console.log(
            `%c !! ERR [${this.desc}] %c +${duration}ms`,
            "background: #F56C6C; color: white; padding: 2px 5px; border-radius: 3px;",
            "color: #909399; font-size: 10px;",
            { error }
        );
    }
}

export class ApiInfo {
    constructor(public path: string, public desc: string) { }
}

export function createApis<T extends Record<string, string>>(apis: T, desc?: Partial<T>) {
    return Object.fromEntries(
        Object.entries(apis).map(([key, path]) => [
            key,
            new ApiInfo(path, desc?.[key] ?? path)
        ])
    ) as { readonly [K in keyof T]: ApiInfo };
}

interface I_CreatePostFactoryOptions {
    host: string;
    timeout?: number;
    showLog?: boolean;
    buildRequestDataFn?: () => Promise<Record<string, any>>;
    buildHeaderFn?: () => Promise<Record<string, string>>;
}

export async function createPostFactory(factoryOptions: I_CreatePostFactoryOptions) {
    const {
        host,
        timeout = 30 * 1000,
        buildRequestDataFn = async () => ({}),
        buildHeaderFn = async () => ({}),
        showLog = false,
    } = factoryOptions;

    const [baseData, baseHeaders] = await Promise.all([buildRequestDataFn(), buildHeaderFn()]);

    return async function <R = unknown, D = unknown>(
        urlInfo: ApiInfo | string,
        data?: D,
        extraOptions?: {
            buildRequestDataFn?: () => Promise<Record<string, any>>;
            buildHeaderFn?: () => Promise<Record<string, any>>;
            responseInterceptor?: (response: any) => Promise<any>;
            timeout?: number
        }
    ): Promise<R> {
        const api = typeof urlInfo === "string" ? new ApiInfo(urlInfo, "unknown api") : urlInfo;
        const logger = new ApiLogger(api.desc, showLog);

        const safeHost = host.replace(/\/$/, "");
        const safePath = api.path.replace(/^\//, "");
        const url = `${safeHost}/${safePath}`;

        const extraData = extraOptions?.buildRequestDataFn ? await extraOptions.buildRequestDataFn() : {};
        const requestData = { ...baseData, ...extraData, ...data };

        const extraHeaders = extraOptions?.buildHeaderFn ? await extraOptions.buildHeaderFn() : {};
        const requestHeaders = {
            "Content-Type": "application/json",
            ...baseHeaders,
            ...extraHeaders,
        };

        logger.logRequest(url, requestData);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), extraOptions?.timeout ?? timeout);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(requestData),
                signal: controller.signal,
            });

            clearTimeout(timer);

            let rawResult: any = await response.text();

            if (extraOptions?.responseInterceptor) {
                rawResult = await extraOptions.responseInterceptor(rawResult);
            }

            try {
                const json = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;

                if (json?.code === "-1" || json?.code === -1) {
                    throw new NotAuthenticatedError();
                }

                logger.logResponse(json);
                return json as R;
            } catch (e) {
                if (e instanceof NotAuthenticatedError) throw e;
                logger.logResponse(rawResult);
                return rawResult as R;
            }
        } catch (error: any) {
            clearTimeout(timer);
            const errInfo = error.name === "AbortError" ? new Error(`Timeout (${timeout}ms)`) : error;
            logger.logError(errInfo);
            throw errInfo;
        }
    };
}
