type ReleaseFunc = () => void;
class LockBusyError extends Error {
    constructor() {
        super("Operation in progress, please try again later.");
        this.name = "LockBusyError";
    }
}
export class AsyncTaskLock {
    private _isLocked = false;
    private waiters: Array<{
        resolve: ReleaseFunc;
        reject: (err: Error) => void;
        timer?: ReturnType<typeof setTimeout>;
    }> = [];

    get isLocked() { return this._isLocked; }
    tryAcquire(): boolean {
        if (this._isLocked) {
            return false; // 锁被占了，直接拒绝，不再排队
        }
        this._isLocked = true;
        return true;
    }
    /**
     * 获取锁
     * @param timeout 超时时间（毫秒），防止死等
     */
    async acquire(timeout?: number): Promise<void> {
        if (!this._isLocked) {
            this._isLocked = true;
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            let timer: ReturnType<typeof setTimeout> | undefined;

            // 如果设置了超时，开启定时器
            if (timeout && timeout > 0) {
                timer = setTimeout(() => {
                    // 超时后从队列中移除自己
                    this.waiters = this.waiters.filter(w => w.timer !== timer);
                    reject(new Error(`Lock acquire timeout after ${timeout}ms`));
                }, timeout);
            }

            this.waiters.push({ resolve, reject, timer });
        });
    }

    async runWithoutQueue<T>(task: () => Promise<T>): Promise<T | null> {
        if (!this.tryAcquire()) {
            throw new LockBusyError(); // 抛出特定错误
        }
        try {
            return await task();
        } finally {
            this.release();
        }
    }



    /**
     * 释放锁
     */
    release() {
        const next = this.waiters.shift();

        if (next) {
            // 如果有定时器，先清除，防止误报超时
            if (next.timer) clearTimeout(next.timer);
            // 唤醒下一个等待者
            // 注意：这里不改 _isLocked，因为锁直接从上一个人传给了下一个人
            next.resolve();
        } else {
            this._isLocked = false;
        }
    }

    /**
     * 自动管理锁的执行器（推荐用法）
     * 自动 acquire 和 release，支持异常捕获
     */
    async run<T>(task: () => Promise<T>, timeout?: number): Promise<T> {
        await this.acquire(timeout);
        try {
            return await task();
        } finally {
            this.release();
        }
    }
}
