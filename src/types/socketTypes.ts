export interface RoomDetails {
    roomId: string;
    gameId: string;
    duration: number;
    remainingSlots: number;
    totalSlots: number;
    userIds: string[];
    userDetails: any[];
    scores: number[];
    joinedAt: Date[];
    disconnectedAt: (Date | number)[];
    bet: number;
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

export interface createNewGameAttributes {
    gameId: string;
    totalSlots: number;
    userId: string;
    duration: number;
    io: any;
    socket: any;
    bet: number;
}

export interface updateAvailableRoomAttributes {
    gameId: string,
    roomId: string,
    userId: string,
    io: any;
    socket: any;
    bet: number;
}
