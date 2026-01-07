

enum ValueInRangeModel {
    "random" = 0,
    "increase" = 1,
    "reduce" = 2
}

type SamplerFunc = <T>(value: T[], model: ValueInRangeModel) => T;
function createSampler(): SamplerFunc {
    let cache: number | null = null;
    return (items, model) => {

        const len = items.length;
        if (len === 0) throw new Error("Sample array cannot be empty");
        if (model == ValueInRangeModel.random) return items[Math.floor(Math.random() * len)];

        if (cache == null) {
            cache = Math.floor(Math.random() * len);
            return items[cache];
        }

        if (model == ValueInRangeModel.increase) {
            cache = (cache + 1) % len;
        } else {
            cache = (cache - 1) % len;
            if (cache < 0) cache = len - 1;
        }
        return items[cache];
    }
}


export const sample = createSampler();
export function valueInRange(range: [number, number], float = 0) {
    const value = Math.random() * (range[1] - range[0]) + range[0]
    return Number(value.toFixed(float))
}



export const Generator = {
    sample,
    valueInRange
}