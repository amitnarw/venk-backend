export interface RoomDetails {
    gameId: string;
    remainingSlots: number;
    totalSlots: number;
    userIds: string[];
    scores: number[];
    joinedAt: Date[];
}

export interface RoomData {
    [roomId: string]: RoomDetails;
}


export interface GameData {
    [gameId: string]: string[];
}

export interface SocketError extends Error {
    data?: { 
        statusCode: number; 
        success: boolean; 
        error: string; 
        errorCode: string;
    };
}