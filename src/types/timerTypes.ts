export type TimerType = 'timeout' | 'gameComplete';

export interface TimersAttributes {
    timerId: NodeJS.Timeout;
    roomId: string;
    type: TimerType;
    startTime: number;
    duration: number;
};
