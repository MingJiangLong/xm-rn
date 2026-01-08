"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCountdown = useCountdown;
const react_1 = require("react");
var CountdownStatus;
(function (CountdownStatus) {
    CountdownStatus[CountdownStatus["idle"] = 0] = "idle";
    CountdownStatus[CountdownStatus["running"] = 1] = "running";
    CountdownStatus[CountdownStatus["done"] = 2] = "done";
    CountdownStatus[CountdownStatus["pause"] = 3] = "pause";
})(CountdownStatus || (CountdownStatus = {}));
/**
 * 该定时器只会存在一个，重复会被覆盖
 */
function useCountdown() {
    var _a, _b;
    const countdownInfoRef = (0, react_1.useRef)(null);
    const [_, setFlag] = (0, react_1.useState)(0);
    /** 0-1循环*/
    const refresh = () => {
        setFlag(pre => (pre + 1) % 2);
    };
    /** start会覆盖之前的 */
    const start = (scope, options) => {
        const countdownInfo = countdownInfoRef.current;
        if (countdownInfo === null || countdownInfo === void 0 ? void 0 : countdownInfo.timer) {
            clearInterval(countdownInfo.timer);
        }
        const { changeIntervalMs = 1000, step = 1 } = options !== null && options !== void 0 ? options : {};
        const [scopeStart, scopeEnd] = scope;
        const isNegative = scopeStart > scopeEnd;
        // 存储定时器信息
        countdownInfoRef.current = ({
            startOptions: [
                scope,
                {
                    changeIntervalMs,
                    step
                }
            ],
            position: scopeStart,
            status: CountdownStatus.running
        });
        countdownInfoRef.current.timer = setInterval(() => {
            const countdownInfo = countdownInfoRef.current;
            if (!countdownInfo) {
                return console.error(`[xm-rn-util] useCountdown.start 定时器信息异常丢失`);
            }
            ;
            const { position, timer } = countdownInfo;
            const nextPosition = isNegative ? position - step : position + step;
            if (isNegative ? nextPosition < scopeEnd : nextPosition > scopeEnd) {
                // 定时器结束
                if (timer) {
                    clearInterval(timer);
                }
                countdownInfo.timer = undefined;
                countdownInfo.status = CountdownStatus.done;
                countdownInfo.position = scopeEnd;
            }
            else {
                countdownInfo.position = nextPosition;
            }
            refresh();
        }, changeIntervalMs);
        refresh();
    };
    const stop = () => {
        const countdownInfo = countdownInfoRef.current;
        if (!countdownInfo) {
            return console.warn(`[xm-rn-util] useCountdown.stop 没有可以暂停的定时器`);
        }
        ;
        const { timer } = countdownInfo;
        if (timer) {
            clearInterval(timer);
        }
        countdownInfo.timer = undefined;
        countdownInfo.status = CountdownStatus.pause;
    };
    const recover = () => {
        const countdownInfo = countdownInfoRef.current;
        if (!countdownInfo || countdownInfo.status !== CountdownStatus.pause) {
            return console.warn(`[xm-rn-util] useCountdown.recover 没有可以恢复的定时器`);
        }
        ;
        const { position } = countdownInfo;
        start([position, countdownInfo.startOptions[0][1]], countdownInfo.startOptions[1]);
    };
    const end = () => {
        const countdownInfo = countdownInfoRef.current;
        if (!countdownInfo)
            return;
        const { timer } = countdownInfo;
        if (timer) {
            clearInterval(timer);
            countdownInfo.timer = undefined;
        }
        countdownInfo.status = CountdownStatus.done;
        countdownInfo.position = countdownInfo.startOptions[0][1];
    };
    const destroy = () => {
        const countdownInfo = countdownInfoRef.current;
        if (!countdownInfo)
            return;
        const { timer } = countdownInfo;
        if (timer) {
            clearInterval(timer);
        }
        countdownInfoRef.current = null;
    };
    return {
        start,
        stop,
        recover,
        end,
        destroy,
        status: (_a = countdownInfoRef.current) === null || _a === void 0 ? void 0 : _a.status,
        position: (_b = countdownInfoRef.current) === null || _b === void 0 ? void 0 : _b.position
    };
}
