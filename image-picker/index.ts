// 基础配置
const IMAGE_DEFAULT_OPTION = {
    mediaType: 'photo',
    maxHeight: 1920,
    maxWidth: 1080,
    includeBase64: true,
    quality: 0.5,
} as const;

// 定义模块接口
interface I_ImagePickerBasic {
    launchCamera: (options: any) => Promise<any>;
    launchImageLibrary: (options: any) => Promise<any>;
}

export class ImagePickerProvider {
    private module: I_ImagePickerBasic | null = null;

    init<T extends I_ImagePickerBasic>(module: T) {
        this.module = module;
    }

    private getModule() {
        if (!this.module) {
            throw new Error("[ImagePickerProvider] Module not injected");
        }
        return this.module;
    }

    /**
     * 统一处理图片库返回的结果
     */
    private handleResponse(result: any) {
        const assets = result?.assets;
        const imageInfo = assets?.[0];
        if (!imageInfo) return undefined;

        return {
            mimeType: imageInfo.type as string,
            base64: imageInfo.base64 as string,
            uri: imageInfo.uri as string,
            name: imageInfo.fileName as string,
        } as const;
    }

    /**
     * 打开相机
     */
    async openCamera(options?: any) {
        const module = this.getModule();
        const result = await module.launchCamera({
            ...IMAGE_DEFAULT_OPTION,
            presentationStyle: "fullScreen",
            ...options,
        });
        return this.handleResponse(result);
    }

    /**
     * 打开相册
     */
    async openGallery(options?: any) {
        const module = this.getModule();
        const result = await module.launchImageLibrary({
            ...IMAGE_DEFAULT_OPTION,
            presentationStyle: "fullScreen",
            ...options,
        });
        return this.handleResponse(result);
    }
}

const ImagePickerProviderInstance = new ImagePickerProvider();
export default ImagePickerProviderInstance;
