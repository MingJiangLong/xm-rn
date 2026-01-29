export function createSleep() {
    let timer: ReturnType<typeof setTimeout> | null = null;
    function delay(delayTime: number = 0) {
        return new Promise((resolve) => {
            timer = setTimeout(() => {
                timer = null;
                resolve(true)
            }, delayTime)
        })
    }
    return {
        delay,
        timer,
    }
}