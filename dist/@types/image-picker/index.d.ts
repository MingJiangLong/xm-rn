type I_ImagePickerBasic = {
    launchCamera: (...args: any[]) => Promise<any>;
    launchImageLibrary: (...args: any[]) => Promise<any>;
};
export declare const useImagePicker: <T extends I_ImagePickerBasic>(module: T) => {
    openCamera: (options?: Parameters<T["launchCamera"]>[0]) => Promise<{
        readonly mimeType: any;
        readonly base64: any;
        readonly uri: any;
        readonly name: any;
    } | undefined>;
    openGallery: (options?: Parameters<T["launchImageLibrary"]>[0]) => Promise<{
        readonly base64: `${any}`;
        readonly uri: any;
        readonly name: any;
        readonly mimeType: any;
    } | undefined>;
};
export {};
