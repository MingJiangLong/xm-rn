"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = exports.sample = void 0;
exports.valueInRange = valueInRange;
var ValueInRangeModel;
(function (ValueInRangeModel) {
    ValueInRangeModel[ValueInRangeModel["random"] = 0] = "random";
    ValueInRangeModel[ValueInRangeModel["increase"] = 1] = "increase";
    ValueInRangeModel[ValueInRangeModel["reduce"] = 2] = "reduce";
})(ValueInRangeModel || (ValueInRangeModel = {}));
function createSampler() {
    let cache = null;
    return (items, model) => {
        const len = items.length;
        if (len === 0)
            throw new Error("Sample array cannot be empty");
        if (model == ValueInRangeModel.random)
            return items[Math.floor(Math.random() * len)];
        if (cache == null) {
            cache = Math.floor(Math.random() * len);
            return items[cache];
        }
        if (model == ValueInRangeModel.increase) {
            cache = (cache + 1) % len;
        }
        else {
            cache = (cache - 1) % len;
            if (cache < 0)
                cache = len - 1;
        }
        return items[cache];
    };
}
exports.sample = createSampler();
function valueInRange(range, float = 0) {
    const value = Math.random() * (range[1] - range[0]) + range[0];
    return Number(value.toFixed(float));
}
exports.Generator = {
    sample: exports.sample,
    valueInRange
};
