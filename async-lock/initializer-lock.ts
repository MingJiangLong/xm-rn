export class InitializerLock {

    isUnlocked: boolean;
    readyPromise: Promise<unknown> | null
    resolveReady: ((value?: unknown) => void) | null
    constructor() {
        this.readyPromise = null;
        this.resolveReady = null;
        this.isUnlocked = false;

        this.readyPromise = new Promise((resolve) => {
            this.resolveReady = resolve;
        });
    }

    unlock() {
        if (this.resolveReady && !this.isUnlocked) {
            this.isUnlocked = true;
            this.resolveReady();
        }
    }

    async wait() {
        await this.readyPromise;
    }
}
