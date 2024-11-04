export interface Room {
    roomId: string;
    remainingSlots: number;
    userIds: string[];
    scores: number[];
    joinedAt: Date[];
}