const IMAGE_DEFAULT_OPTION = {
    mediaType: 'photo',
    maxHeight: 1920,
    maxWidth: 1080,
    includeBase64: true,
    quality: .5,
} as const


type I_ImagePickerBasic = {
    launchCamera: (...args: any[]) => Promise<any>
    launchImageLibrary: (...args: any[]) => Promise<any>
}


export const useImagePicker = <T extends I_ImagePickerBasic>(module: T) => {

    async function openCamera(options?: Parameters<T["launchCamera"]>[0]) {
        const result = await module.launchCamera({
            ...IMAGE_DEFAULT_OPTION,
            presentationStyle: "fullScreen",
            ...options,
        })
        const assets = result?.assets
        const imageInfo = assets?.[0];
        if (!imageInfo) return undefined;
        return {
            mimeType: imageInfo.type,
            base64: imageInfo.base64,
            uri: imageInfo.uri,
            name: imageInfo.fileName,
        } as const
    }
    async function openGallery(options?: Parameters<T["launchImageLibrary"]>[0]) {
        const result = await module.launchImageLibrary({
            ...IMAGE_DEFAULT_OPTION,
            presentationStyle: "fullScreen",
            ...options
        })
        const assets = result?.assets
        const imageInfo = assets?.[0]
        if (!imageInfo) return undefined;
        return {
            base64: `${imageInfo?.base64}`,
            uri: imageInfo.uri,
            name: imageInfo?.fileName,
            mimeType: imageInfo?.type,
        } as const
    }



    return {
        openCamera,
        openGallery
    }
}