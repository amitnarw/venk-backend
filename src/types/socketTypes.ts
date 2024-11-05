export interface Room {
    gameId: string;
    roomId: string;
    remainingSlots: number;
    userIds: string[];
    scores: number[];
    joinedAt: Date[];
}