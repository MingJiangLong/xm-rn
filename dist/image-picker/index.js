"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useImagePicker = void 0;
const IMAGE_DEFAULT_OPTION = {
    mediaType: 'photo',
    maxHeight: 1920,
    maxWidth: 1080,
    includeBase64: true,
    quality: .5,
};
const useImagePicker = (module) => {
    function openCamera(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield module.launchCamera(Object.assign(Object.assign(Object.assign({}, IMAGE_DEFAULT_OPTION), { presentationStyle: "fullScreen" }), options));
            const assets = result === null || result === void 0 ? void 0 : result.assets;
            const imageInfo = assets === null || assets === void 0 ? void 0 : assets[0];
            if (!imageInfo)
                return undefined;
            return {
                mimeType: imageInfo.type,
                base64: imageInfo.base64,
                uri: imageInfo.uri,
                name: imageInfo.fileName,
            };
        });
    }
    function openGallery(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield module.launchImageLibrary(Object.assign(Object.assign(Object.assign({}, IMAGE_DEFAULT_OPTION), { presentationStyle: "fullScreen" }), options));
            const assets = result === null || result === void 0 ? void 0 : result.assets;
            const imageInfo = assets === null || assets === void 0 ? void 0 : assets[0];
            if (!imageInfo)
                return undefined;
            return {
                base64: `${imageInfo === null || imageInfo === void 0 ? void 0 : imageInfo.base64}`,
                uri: imageInfo.uri,
                name: imageInfo === null || imageInfo === void 0 ? void 0 : imageInfo.fileName,
                mimeType: imageInfo === null || imageInfo === void 0 ? void 0 : imageInfo.type,
            };
        });
    }
    return {
        openCamera,
        openGallery
    };
};
exports.useImagePicker = useImagePicker;
