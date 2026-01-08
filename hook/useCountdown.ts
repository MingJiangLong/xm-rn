import { useRef, useState } from 'react'

enum CountdownStatus {
    "idle" = 0,
    "running" = 1,
    "done" = 2,
    "pause" = 3
}
interface I_CountdownInfo {
    status: CountdownStatus
    position: number
    timer?: ReturnType<typeof setInterval>
    startOptions: [[number, number], I_StartOptions]
}


interface I_StartOptions {
    /** N毫秒变化一次 */
    changeIntervalMs?: number

    /** 变化步长 */
    step?: number
}

/**
 * 该定时器只会存在一个，重复会被覆盖
 */
export function useCountdown() {

    const countdownInfoRef = useRef<I_CountdownInfo | null>(null);
    const [_, setFlag] = useState(0);

    /** 0-1循环*/
    const refresh = () => {
        setFlag(pre => (pre + 1) % 2)
    }


    /** start会覆盖之前的 */
    const start = (scope: [number, number], options?: I_StartOptions) => {

        const countdownInfo = countdownInfoRef.current;
        if (countdownInfo?.timer) {
            clearInterval(countdownInfo.timer)
        }

        const { changeIntervalMs = 1000, step = 1 } = options ?? {}
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
        })

        countdownInfoRef.current.timer = setInterval(() => {
            const countdownInfo = countdownInfoRef.current;
            if (!countdownInfo) {
                return console.error(`[xm-rn-util] useCountdown.start 定时器信息异常丢失`);
            };
            const { position, timer } = countdownInfo

            const nextPosition = isNegative ? position - step : position + step;
            if (isNegative ? nextPosition < scopeEnd : nextPosition > scopeEnd) {
                // 定时器结束
                if (timer) {
                    clearInterval(timer);
                }
                countdownInfo.timer = undefined;
                countdownInfo.status = CountdownStatus.done;
                countdownInfo.position = scopeEnd;
            } else {
                countdownInfo.position = nextPosition;
            }
            refresh();
        }, changeIntervalMs)
        refresh();
    }

    const stop = () => {
        const countdownInfo = countdownInfoRef.current;
        if (!countdownInfo) {
            return console.warn(`[xm-rn-util] useCountdown.stop 没有可以暂停的定时器`);
        };
        const { timer } = countdownInfo;
        if (timer) {
            clearInterval(timer);
        }
        countdownInfo.timer = undefined;
        countdownInfo.status = CountdownStatus.pause;
    }


    const recover = () => {
        const countdownInfo = countdownInfoRef.current;
        if (!countdownInfo || countdownInfo.status !== CountdownStatus.pause) {
            return console.warn(`[xm-rn-util] useCountdown.recover 没有可以恢复的定时器`);
        };
        const { position } = countdownInfo;
        start([position, countdownInfo.startOptions[0][1]], countdownInfo.startOptions[1])
    }



    const end = () => {
        const countdownInfo = countdownInfoRef.current;
        if (!countdownInfo) return;
        const { timer } = countdownInfo;
        if (timer) {
            clearInterval(timer);
            countdownInfo.timer = undefined;
        }
        countdownInfo.status = CountdownStatus.done;
        countdownInfo.position = countdownInfo.startOptions[0][1];
    }


    const destroy = () => {
        const countdownInfo = countdownInfoRef.current;
        if (!countdownInfo) return;
        const { timer } = countdownInfo;
        if (timer) {
            clearInterval(timer);
        }
        countdownInfoRef.current = null;
    }

    return {
        start,
        stop,
        recover,
        end,
        destroy,
        status: countdownInfoRef.current?.status,
        position: countdownInfoRef.current?.position
    }

}