export class SleepController {
    private timer: ReturnType<typeof setTimeout> | null = null;
    private rejecter: ((reason?: any) => void) | null = null;

    /**
     * 等待
     * @param ms 毫秒
     * @param signal 支持外部 AbortSignal 取消
     */
    delay(ms: number, signal?: AbortSignal): Promise<void> {
        this.cancel(); // 开启新等待前，先清理旧的

        return new Promise((resolve, reject) => {
            if (signal?.aborted) return reject(new Error('aborted'));

            this.rejecter = reject;
            this.timer = setTimeout(() => {
                this.clean();
                resolve();
            }, ms);

            // 支持原生 AbortController 取消
            signal?.addEventListener('abort', () => {
                this.cancel();
            });
        });
    }

    /**
     * 手动打断睡眠
     */
    cancel() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.rejecter?.(new Error('Sleep cancelled'));
            this.clean();
        }
    }

    private clean() {
        this.timer = null;
        this.rejecter = null;
    }

    // 获取当前是否正在睡眠（解决你之前获取不到最新 timer 的问题）
    get isSleeping() {
        return this.timer !== null;
    }
}

export function sleep(ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    let rejecter: (err: any) => void;

    const promise = new Promise<void>((resolve, reject) => {
        rejecter = reject;
        timer = setTimeout(resolve, ms);
    });

    return {
        promise,
        cancel: () => {
            clearTimeout(timer);
            rejecter(new Error('Cancelled'));
        }
    };
}
