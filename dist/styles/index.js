"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppStyle = exports.createAspectStyle = exports.FixSize = void 0;
exports.createInlineStyle = createInlineStyle;
const react_native_1 = require("react-native");
var FixSize;
(function (FixSize) {
    FixSize[FixSize["height"] = 1] = "height";
    FixSize[FixSize["width"] = 2] = "width";
})(FixSize || (exports.FixSize = FixSize = {}));
function resizeValue(resizeHorizontal, resizeVertical) {
    return (value) => {
        const regexp = /^(\-?\d+(?:\.\d*)?)@(h|v)(r?)$/;
        const canResize = regexp.test(value);
        if (!canResize)
            return value;
        const regexpResult = regexp.exec(value);
        if (!regexpResult)
            return value;
        const [_all, size, resizedType, needRound] = regexpResult;
        const sizeNumber = parseFloat(size);
        let roundFn = (value) => value;
        if (needRound == "r") {
            roundFn = (value) => Math.round(value);
        }
        let resizeFn = resizeHorizontal;
        if (resizedType == "v") {
            resizeFn = resizeVertical;
        }
        return react_native_1.PixelRatio.roundToNearestPixel(roundFn(resizeFn(sizeNumber)));
    };
}
function resizeObjectAndArrayValue(items, resizeFn) {
    const isValueObject = isObject(items);
    const isValueArray = Array.isArray(items);
    if (isValueObject) {
        return Object.keys(items).reduce((total, current) => {
            total[current] = resizeObjectAndArrayValue(items[current], resizeFn);
            return total;
        }, {});
    }
    if (isValueArray) {
        return items.map(resizeFn);
    }
    return resizeFn(items);
}
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function createAppStyleBuilder(UIWidth = 375, UIHeight = 812) {
    const { width: temptWidthDp, height: temptHeightDp } = react_native_1.Dimensions.get("window");
    // 实际上设备的宽高
    const [windowWidthDp, windowHeightDp] = temptWidthDp > temptHeightDp ? [temptHeightDp, temptWidthDp] : [temptWidthDp, temptHeightDp,];
    /**
     * container 信息
     * 还是会有问题
     * 如果长宽高不能撑满整个试图？
     * @param currentWidthPx 当前容器px宽
     * @param currentHeightPx 当前容器px高
     */
    return (styleObject) => {
        return react_native_1.StyleSheet.create(resizeObjectAndArrayValue(styleObject, resizeValue((horizontalPxValue) => (horizontalPxValue / UIWidth) * windowWidthDp, (verticalPxValue) => (verticalPxValue / UIHeight) * windowHeightDp)));
    };
}
function createAspectStyleBuilder(UIWidth = 375, UIHeight = 812) {
    const { width: temptWidthDp, height: temptHeightDp } = react_native_1.Dimensions.get("window");
    // 实际上设备的宽高
    const [windowWidthDp, windowHeightDp] = temptWidthDp > temptHeightDp ? [temptHeightDp, temptWidthDp] : [temptWidthDp, temptHeightDp,];
    /**
     * container 信息
     * 还是会有问题
     * 如果长宽高不能撑满整个试图？
     * @param currentWidthPx 当前容器px宽
     * @param currentHeightPx 当前容器px高
     */
    return (localWidthPx = 375, localHeightPx = 812, fixed = FixSize.width) => {
        let localWidthDp = windowWidthDp * (localWidthPx / UIWidth);
        let localHeightDp = windowHeightDp * (localHeightPx / UIHeight);
        if (fixed == FixSize.height) {
            localWidthDp = localHeightDp * (localWidthPx / localHeightPx);
        }
        if (fixed == FixSize.width) {
            localHeightDp = localWidthDp / (localWidthPx / localHeightPx);
        }
        return (styleObject) => {
            return react_native_1.StyleSheet.create(resizeObjectAndArrayValue(styleObject, resizeValue((horizontalPxValue) => (horizontalPxValue / localWidthPx) * localWidthDp, (verticalPxValue) => (verticalPxValue / localHeightPx) * localHeightDp)));
        };
    };
}
function createInlineStyle(value) {
    const temp = (0, exports.createAppStyle)({
        appStyle: value
    });
    return temp.appStyle;
}
exports.createAspectStyle = createAspectStyleBuilder();
exports.createAppStyle = createAppStyleBuilder();
