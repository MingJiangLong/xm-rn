import { ImageStyle, TextStyle, ViewStyle, RegisteredStyle } from "react-native";
export declare enum FixSize {
    height = 1,
    width = 2
}
export declare function createInlineStyle<T extends I_StyleValue<TextStyle | ViewStyle | ImageStyle>>(value: T): RegisteredStyle<{ [S in keyof T_1[P]]: T_1[P][S] extends I_ResizedValue ? number : T_1[P][S]; }>;
export declare const createAspectStyle: (localWidthPx?: number, localHeightPx?: number, fixed?: FixSize) => <T extends I_Styles<ViewStyle, TextStyle, ImageStyle>>(styleObject: T) => { [P in keyof T]: RegisteredStyle<{ [S in keyof T[P]]: T[P][S] extends I_ResizedValue ? number : T[P][S]; }>; };
export declare const createAppStyle: <T extends I_Styles<ViewStyle, TextStyle, ImageStyle>>(styleObject: T) => { [P in keyof T]: RegisteredStyle<{ [S in keyof T[P]]: T[P][S] extends I_ResizedValue ? number : T[P][S]; }>; };
type I_HorizontalValue = `${number}@h${'r' | ''}`;
type I_VerticalValue = `${number}@v${'r' | ''}`;
type I_ResizedValue = I_HorizontalValue | I_VerticalValue;
type I_StyleValue<T> = {
    [P in keyof T]: number extends T[P] ? I_ResizedValue | T[P] : T[P];
};
type I_ViewStyle<T> = I_StyleValue<T>;
type I_TextStyle<T> = I_StyleValue<T>;
type I_ImageStyle<T> = I_StyleValue<T>;
type I_Styles<V, T, I> = {
    [k: string]: I_ViewStyle<V> | I_TextStyle<T> | I_ImageStyle<I>;
};
export {};
