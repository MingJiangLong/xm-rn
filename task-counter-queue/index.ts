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

    // 入队：只负责 push，闭眼添加
    push() {
        this.queue.push(null);
        this.notify();
    }

    // 出队：只负责 shift，严格遵循先进先出
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

