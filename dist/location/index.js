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
exports.useLocation = void 0;
const add_timeout_1 = require("../add-timeout");
const error_1 = require("../error");
const useLocation = (module) => {
    function getCurrentPosition() {
        const fetchLocationPromise = new Promise((s, e) => {
            module.setRNConfiguration({ skipPermissionRequests: true });
            module.getCurrentPosition((info) => {
                s({
                    latitude: info.coords.latitude,
                    longitude: info.coords.longitude,
                    is_current: true
                });
            }, (error) => {
                const code = error === null || error === void 0 ? void 0 : error.code;
                if (code == 2)
                    return e(new error_1.TimeoutError(error));
                e(error);
            }, { timeout: 10000, enableHighAccuracy: false });
        });
        return (0, add_timeout_1.addTimeout)(() => fetchLocationPromise)();
    }
    const fetchLocationDescUrl = function (latitude, longitude) {
        return `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    };
    const getCurrentPositionDetail = (0, add_timeout_1.addTimeout)(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const location = yield getCurrentPosition();
            let url = fetchLocationDescUrl(location.latitude, location.longitude);
            const res = yield fetch(url, { method: "GET" });
            const tempData = yield res.text();
            const resJson = JSON.parse(tempData);
            return Object.assign(Object.assign({}, resJson === null || resJson === void 0 ? void 0 : resJson.address), location);
        });
    });
    return {
        getCurrentPosition,
        getCurrentPositionDetail
    };
};
exports.useLocation = useLocation;
