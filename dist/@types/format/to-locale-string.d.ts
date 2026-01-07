/**
 *
 * @param value
 * @param locale
 * @param fractionDigits
 * @example
 * toLocaleString(22222.22)// 22,222.22
 * toLocaleString(22222.22, "zh-CN")// 22,222.22
 * toLocaleString(22222.22, "en-US")// 22,222.22
 * toLocaleString(22222.22, "vi-VN")// 22.222,22
 * toLocaleString(22222.22, "th-TH")// 22,222.22
 * toLocaleString(22222.22, "es-MX")// 22,222.22
 * @returns
 */
export declare function toLocaleString(value: unknown, locale?: Intl.LocalesArgument, fractionDigits?: number): string;
