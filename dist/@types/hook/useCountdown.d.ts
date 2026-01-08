declare enum CountdownStatus {
    "idle" = 0,
    "running" = 1,
    "done" = 2,
    "pause" = 3
}
interface I_StartOptions {
    /** N毫秒变化一次 */
    changeIntervalMs?: number;
    /** 变化步长 */
    step?: number;
}
/**
 * 该定时器只会存在一个，重复会被覆盖
 */
export declare function useCountdown(): {
    start: (scope: [number, number], options?: I_StartOptions) => void;
    stop: () => void;
    recover: () => void;
    end: () => void;
    destroy: () => void;
    status: CountdownStatus | undefined;
    position: number | undefined;
};
export {};
