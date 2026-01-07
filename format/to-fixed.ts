/**
 * 
 * @param value 
 * @param fractionDigits
 * @example
 * toFixed(2.1234,2)// 2.12
 * toFixed(2.1234)// 2.12
 * toFixed(2.123)// 2.12
 * toFixed(2.1)// 2.1
 * toFixed(2)// 2 
 * @returns 
 */
export function toFixed(value: unknown, fractionDigits = 2) {
    const num = Number(value);
    if (isNaN(num)) {
        return 0;
    }
    const digits = Math.max(0, Math.floor(fractionDigits));
    if (digits === 0) {
        return Math.round(num);
    }
    const factor = Math.pow(10, digits);
    const roundedValue = Math.round(num * factor);
    return roundedValue / factor;
}