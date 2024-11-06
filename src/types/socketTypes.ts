export interface Room {
    gameId: string;
    roomId: string;
    remainingSlots: number;
    userIds: string[];
    scores: number[];
    joinedAt: Date[];
}

export interface SocketError extends Error {
    data?: { 
        statusCode: number; 
        success: boolean; 
        error: string; 
        errorCode: string;
    };
}