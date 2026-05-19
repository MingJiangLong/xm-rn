import { LockBusyError, TimeoutError } from "../error";

type ReleaseFunc = () => void;

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
            return false;
        }
        this._isLocked = true;
        return true;
    }
    async acquire(timeout?: number): Promise<void> {
        if (!this._isLocked) {
            this._isLocked = true;
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            let timer: ReturnType<typeof setTimeout> | undefined;
            if (timeout && timeout > 0) {
                timer = setTimeout(() => {
                    this.waiters = this.waiters.filter(w => w.timer !== timer);
                    reject(new TimeoutError(`Lock acquire timeout after ${timeout}ms`));
                }, timeout);
            }

            this.waiters.push({ resolve, reject, timer });
        });
    }

    async runWithoutQueue<T>(task: () => Promise<T>): Promise<T | null> {
        if (!this.tryAcquire()) {
            throw new LockBusyError();
        }
        try {
            return await task();
        } finally {
            this.release();
        }
    }




    release() {
        const next = this.waiters.shift();

        if (next) {
            if (next.timer) clearTimeout(next.timer);
            next.resolve();
        } else {
            this._isLocked = false;
        }
    }

    async run<T>(task: () => Promise<T>, timeout?: number): Promise<T> {
        await this.acquire(timeout);
        try {
            return await task();
        } finally {
            this.release();
        }
    }
}
