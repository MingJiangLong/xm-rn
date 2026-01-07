declare enum ValueInRangeModel {
    "random" = 0,
    "increase" = 1,
    "reduce" = 2
}
type SamplerFunc = <T>(value: T[], model: ValueInRangeModel) => T;
export declare const sample: SamplerFunc;
export declare function valueInRange(range: [number, number], float?: number): number;
export declare const Generator: {
    sample: SamplerFunc;
    valueInRange: typeof valueInRange;
};
export {};
