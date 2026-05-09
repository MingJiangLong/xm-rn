import { useRef } from 'react';
import { AsyncTaskLock } from '../async-lock';
function useLock() {
    // 使用 useRef 保证每个组件实例拥有独立的锁，且重渲染时不重置
    const lockRef = useRef(new AsyncTaskLock());

    return {
        // 自动处理排队
        runSafe: lockRef.current.run.bind(lockRef.current),
        // 防连点
        runOnce: lockRef.current.runWithoutQueue.bind(lockRef.current),
        isLocked: lockRef.current.isLocked
    };
}