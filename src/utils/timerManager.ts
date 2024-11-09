import { TimersAttributes, TimerType } from "types/timerTypes";

const timers: Record<string, TimersAttributes> = {};

export const startTimer = (roomId: string, type: TimerType, duration: number, callback: () => void) => {
    clearTimer(roomId);
    
    const timerId = setTimeout(()=>{
        callback();
        delete timers[roomId];
    }, duration)

    timers[roomId] = {
        timerId,
        roomId,
        type,
        startTime: Date.now(),
        duration
    }

    return timers[roomId];
}

export const checkTimer = (roomId: string) => {
    return timers[roomId] || null
}

export const clearTimer = (roomId: string) => {
    if(timers[roomId]){
        clearTimeout(timers[roomId].timerId);
        delete timers[roomId];
        return true;
    } else {
        return false;
    }
}

export const getRemainingTime = (roomId: string) => {
    const timer = timers[roomId];
    if (timer) {
        const elapsedTime = Date.now() - timer.startTime;
        return Math.max(timer.duration - elapsedTime, 0);
    }
    return null;
}