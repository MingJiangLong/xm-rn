import { toFixed } from "./to-fixed";

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
export function toLocaleString(value: unknown, locale?: Intl.LocalesArgument, fractionDigits = 2) {
    const valueNum = toFixed(value, fractionDigits);
    return new Intl.NumberFormat(locale, {
        style: 'decimal',
        useGrouping: true, // 开启千位分隔符
    }).format(valueNum);
}