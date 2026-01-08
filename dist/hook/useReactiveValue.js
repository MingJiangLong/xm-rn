"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReactiveValue = useReactiveValue;
const react_1 = require("react");
function canBeProxy(value) {
    return typeof value === 'object' && value !== null;
}
function useReactiveValue(target) {
    const [state, setState] = (0, react_1.useState)({ value: target });
    const proxiedMap = (0, react_1.useRef)(new WeakMap()).current;
    const addNestedProxy = (0, react_1.useCallback)((data) => {
        if (!canBeProxy(data))
            return data;
        if (proxiedMap.has(data)) {
            return proxiedMap.get(data);
        }
        const ret = new Proxy(data, {
            get(obj, prop) {
                const ret = Reflect.get(obj, prop);
                return addNestedProxy(ret);
            },
            set(obj, prop, value) {
                const oldValue = Reflect.get(obj, prop);
                if (oldValue === value)
                    return true;
                const success = Reflect.set(obj, prop, value);
                if (success)
                    setState(Object.assign({}, state));
                return true;
            }
        });
        proxiedMap.set(data, ret);
        return ret;
    }, []);
    return (0, react_1.useMemo)(() => {
        return addNestedProxy(state);
    }, [state]);
}
