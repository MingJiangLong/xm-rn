type Listener = (haveTask: boolean) => void;

export class TaskCounterQueue {
    private queue: null[] = [];
    private listeners = new Set<Listener>();

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        listener(this.queue.length > 0);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach((listener) => listener(this.queue.length > 0));
    }

    push() {
        this.queue.push(null);
        this.notify();
    }

    shift() {
        if (this.queue.length > 0) {
            this.queue.shift();
            this.notify();
        }
    }

    clear() {
        this.queue = [];
        this.notify();
    }
}

