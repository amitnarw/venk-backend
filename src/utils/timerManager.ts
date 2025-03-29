import { Server } from "socket.io";
import { TimersAttributes, TimerType } from "types/timerTypes";

const timers: Record<string, TimersAttributes> = {};
let globalTimerId: NodeJS.Timeout | null = null;

export const startTimer = (roomId: string, step: number, type: TimerType, duration: number, callback: () => void, io: Server) => {
    clearTimer(roomId);

    const timerId = setTimeout(() => {
        callback();
        delete timers[roomId];
        stopGlobalTimer();
    }, duration)

    timers[roomId] = {
        timerId,
        roomId,
        step,
        type,
        startTime: Date.now(),
        duration,
        callback
    }

    if (!globalTimerId) {
        startGlobalTimer(io);
    }

    return timers[roomId];
}

export const checkTimer = (roomId: string) => {
    return timers[roomId] || null
}

export const clearTimer = (roomId: string) => {
    if (timers[roomId]) {
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

export const startGlobalTimer = (io: Server) => {
    if (globalTimerId) return;

    globalTimerId = setInterval(() => {
        const activeRooms = Object.keys(timers);
        
        if (activeRooms.length === 0) {
            stopGlobalTimer();
            return;
        }

        activeRooms.forEach((roomId) => {
            const timer = timers[roomId];
            if (timer) {
                const currentTime = Date.now();
                const elapsedTime = currentTime - timer.startTime;
                const remainingTime = Math.max(timer.duration - elapsedTime, 0);

                io.to(roomId).emit("GAME_TIMER", {
                    roomId,
                    totalTime: timer.duration,
                    currentTime,
                    remainingTime
                });
            }
        });
    }, 1000);
};

export const stopGlobalTimer = () => {
    if (Object.keys(timers).length === 0 && globalTimerId) {
        clearInterval(globalTimerId);
        globalTimerId = null;
    }
};