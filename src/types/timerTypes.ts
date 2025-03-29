export type TimerType = 'timeout' | 'gameComplete';

export interface TimersAttributes {
    timerId: NodeJS.Timeout;
    roomId: string;
    step: number;
    type: TimerType;
    startTime: number;
    duration: number;
    callback: () => void;
};
