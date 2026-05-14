import { ImageStyle, TextStyle, ViewStyle, useWindowDimensions, PixelRatio } from "react-native";

const RESIZE_REGEX = /^(\-?\d+(?:\.\d*)?)@(h|v)(r?)$/;
type ScaleMode = "width" | "height" | "fit";

const FONT_SIZE_LIMIT = {
    MIN: 10,
    MAX: 40,
};

function resizeValue(
    horizontalRatio: number,
    verticalRatio: number,
    propKey?: string
) {
    return (value: any) => {
        if (typeof value !== 'string') return value;
        const match = RESIZE_REGEX.exec(value);
        if (!match) return value;
        const [_all, size, resizedType, needRound] = match;
        const sizeNumber = parseFloat(size);
        if (isNaN(sizeNumber)) return 0;

        const roundFn = needRound === 'r' ? (v: number) => Math.round(v) : (v: number) => v;
        const ratio = resizedType === 'v' ? verticalRatio : horizontalRatio;

        let finalValue = PixelRatio.roundToNearestPixel(roundFn(ratio * sizeNumber));

        if (propKey === 'fontSize') {
            finalValue = Math.max(FONT_SIZE_LIMIT.MIN, Math.min(FONT_SIZE_LIMIT.MAX, finalValue));
        }

        return finalValue;
    };
}

function resizeObjectAndArrayValue(
    items: any,
    baseScaleX: number,
    baseScaleY: number,
    currentScaleMode: ScaleMode,
    currentKey?: string
): any {
    if (isPlainObject(items)) {
        let mode = currentScaleMode;

        if (items.scaleByWidth === true) mode = "width";
        else if (items.scaleByHeight === true) mode = "height";
        else if (items.scaleByFit === true) mode = "fit";

        let currentHorizontalRatio = baseScaleX;
        let currentVerticalRatio = baseScaleY;
        if (mode === "width") currentVerticalRatio = baseScaleX;
        if (mode === "height") currentHorizontalRatio = baseScaleY;

        return Object.keys(items).reduce((total, current) => {
            if (['scaleByWidth', 'scaleByHeight', 'scaleByFit'].includes(current)) {
                return total;
            }
            total[current] = resizeObjectAndArrayValue(
                items[current],
                baseScaleX,
                baseScaleY,
                mode,
                current
            );
            return total;
        }, {} as any);
    }

    if (Array.isArray(items)) {
        return items.map((it) => resizeObjectAndArrayValue(it, baseScaleX, baseScaleY, currentScaleMode, currentKey));
    }
    let finalHorizontalRatio = baseScaleX;
    let finalVerticalRatio = baseScaleY;
    if (currentScaleMode === "width") finalVerticalRatio = baseScaleX;
    if (currentScaleMode === "height") finalHorizontalRatio = baseScaleY;

    return resizeValue(finalHorizontalRatio, finalVerticalRatio, currentKey)(items);
}

function isPlainObject(value: any): value is Record<string, any> {
    return Object.prototype.toString.call(value) === '[object Object]';
}

export function createResponsiveStyleBuilder(
    UIWidth: number = 375,
    UIHeight: number = 812
) {
    return <T extends StylesMap>(
        styleObject: T,
        windowWidth: number,
        windowHeight: number,
        defaultScaleBy: ScaleMode = "fit"
    ) => {
        const scaleX = windowWidth / UIWidth;
        const scaleY = windowHeight / UIHeight;
        return resizeObjectAndArrayValue(styleObject, scaleX, scaleY, defaultScaleBy);
    };
}

const transformStyle = createResponsiveStyleBuilder();
export function useResponsiveStyle<T extends StylesMap>(
    styleObject: T,
    defaultScaleBy: ScaleMode = "fit"
): CustomRegisteredStyle<T> {
    const { width, height } = useWindowDimensions();
    return transformStyle(styleObject, width, height, defaultScaleBy);
}

export function useInlineStyle<T extends CustomStyleValue<TextStyle & ViewStyle & ImageStyle>>(
    value: T,
    defaultScaleBy: ScaleMode = "fit"
): Omit<T, 'scaleByWidth' | 'scaleByHeight' | 'scaleByFit'> {
    const { width, height } = useWindowDimensions();
    const temp = transformStyle({ appStyle: value }, width, height, defaultScaleBy);
    return temp.appStyle;
}

type HorizontalResizedValue = `${number}@h${'r' | ''}`;
type VerticalResizedValue = `${number}@v${'r' | ''}`;
type ResizedValue = HorizontalResizedValue | VerticalResizedValue;

type BaseControlProps = {
    scaleByWidth?: boolean;
    scaleByHeight?: boolean;
    scaleByFit?: boolean;
};

type CustomStyleValue<T> = BaseControlProps & {
    [P in keyof T]: number extends T[P] ? ResizedValue | T[P] : T[P];
};

type StylesMap = {
    [k: string]: CustomStyleValue<ViewStyle> | CustomStyleValue<TextStyle> | CustomStyleValue<ImageStyle>;
};

type CustomRegisteredStyle<T extends StylesMap> = {
    [P in keyof T]: Omit<{
        [S in keyof T[P]]: T[P][S] extends ResizedValue ? number : T[P][S];
    }, 'scaleByWidth' | 'scaleByHeight' | 'scaleByFit'>;
};
