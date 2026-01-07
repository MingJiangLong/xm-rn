export declare class ApiInfo {
    path: string;
    desc: string;
    constructor(path: string, desc: string);
}
export declare function createApis<T extends Record<string, string>>(apis: T, desc?: T): Record<keyof T, ApiInfo>;
interface I_CreatePostFactoryOptions {
    host: string;
    timeout?: number;
    showLog?: boolean;
    buildRequestDataFn?: () => Promise<Record<string, any>>;
    buildHeaderFn?: () => Promise<Record<string, string>>;
}
export declare function createPostFactory(options: I_CreatePostFactoryOptions): Promise<(<R = unknown, D = unknown>(urlInfo: ApiInfo | string, data?: D, options?: {
    buildRequestDataFn?: () => Promise<Record<string, any>>;
    buildHeaderFn?: () => Promise<Record<string, any>>;
    responseInterceptor?: (response: any) => Promise<R>;
}) => Promise<R>)>;
export {};
