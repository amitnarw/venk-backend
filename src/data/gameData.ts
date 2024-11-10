import { v4 as uuid_v4 } from 'uuid';
import { createNewGameAttributes, GameData, RoomData, updateAvailableRoomAttributes } from "../types/socketTypes";
import { Rooms } from '../db/models';
import { checkTimer, clearTimer, startTimer } from '../utils/timerManager';
import { Socket } from 'socket.io';

let activeGames: string[] = [];
let availableRooms: string[] = [];
let activeRooms: string[] = [];

let gameData: GameData = {}
let roomData: RoomData = {}

export const getAllActiveGames = () => {
    return activeGames;
}

export const getAllActiveRooms = () => {
    return activeRooms;
}

export const getAllAvailableRooms = () => {
    return availableRooms;
}

export const checkIfGameActive = (gameId: string) => {
    return activeGames.includes(gameId);
}

export const checkIfRoomActive = (roomId: string) => {
    return activeRooms.includes(roomId);
}

export const checkIfRoomAvailable = (gameId: string) => {
    const roomId = gameData[gameId].find(roomId => availableRooms.includes(roomId));
    return roomId || null;
}

export const isUserInAnyRoom = (userId: string) => {
    let returnData = {
        success: false,
        index: -1,
        data: {},
        statusCode: 400
    };
    Object.values(roomData).some((roomDetails, index) => {
        let check = roomDetails.userIds.includes(userId);
        if (check) {
            returnData = {
                success: true,
                index: index,
                data: roomDetails,
                statusCode: 200
            }
        }
    });
    return returnData;
};

export const getAllRoomsOfGame = (gameId: string) => {
    return gameData[gameId]
}

export const getDataOfRoom = (roomId: string) => {
    return roomData[roomId]
}

export const totalSlotsInRoom = (roomId: string) => {
    return roomData[roomId].totalSlots;
}

export const remainingSlotsInRoom = (roomId: string) => {
    return roomData[roomId].remainingSlots;
}

export const updateScore = ({ io, socket, roomId, userId, score }: { io: any, socket: any, roomId: string, userId: string, score: number }) => {
    let index = roomData[roomId].userIds.indexOf(userId);
    roomData[roomId].scores[index] = score;
    emitStatus({ io, socket, roomId, message: "Score updated", duration: roomData[roomId]?.duration, step: 2 });
}

export const updateAvailableRoom = ({ gameId, roomId, userId, io, socket }: updateAvailableRoomAttributes) => {
    roomData[roomId].remainingSlots -= 1;
    roomData[roomId].userIds.push(userId);
    roomData[roomId].scores.push(0);
    roomData[roomId].joinedAt.push(new Date());
    roomData[roomId].disconnectedAt.push(0);
    if (roomData[roomId].remainingSlots === 0) {
        // fromAvailableToActive(roomId);
        clearTimer(roomId);
        commonProcessStartGame({ roomId, gameId, userId, io, socket });
    } else {
        emitStatus({ io, socket, roomId, message: `New player joined, waiting for ${roomData[roomId].remainingSlots} players`, duration: 20000, step: 1 });
    }
}

export const createNewAvailableRoom = ({ gameId, totalSlots, userId, duration, io, socket }: createNewGameAttributes) => {
    const roomId = `roomId-${uuid_v4()}`;
    availableRooms.push(roomId);
    gameData[gameId].push(roomId);
    let newData = {
        roomId,
        gameId,
        duration,
        remainingSlots: totalSlots - 1,
        totalSlots,
        userIds: [userId],
        scores: [0],
        joinedAt: [new Date()],
        disconnectedAt: [0]
    }
    roomData[roomId] = newData;
    commonProcessWaiting({ roomId, gameId, userId, io, socket });
}

export const createNewGame = ({ gameId, totalSlots, userId, duration, io, socket }: createNewGameAttributes) => {
    const roomId = `roomId-${uuid_v4()}`;
    activeGames.push(gameId);
    availableRooms.push(roomId);
    gameData[gameId] = [roomId];
    let newData = {
        roomId,
        gameId,
        duration,
        remainingSlots: totalSlots - 1,
        totalSlots,
        userIds: [userId],
        scores: [0],
        joinedAt: [new Date()],
        disconnectedAt: [0]
    }
    roomData[roomId] = newData;
    commonProcessWaiting({ roomId, gameId, userId, io, socket });
}

const commonProcessWaiting = ({ roomId, gameId, userId, io, socket }: { roomId: string, gameId: string, userId: string, io: any, socket: any }) => {

    emitStatus({ io, socket, roomId, message: `Room created, waiting for ${roomData[roomId].remainingSlots} players`, duration: 20000, step: 1 });
    startTimer(roomId, 1, 'timeout', 20000, async () => {
        commonProcessStartGame({ roomId, gameId, userId, io, socket });
    });
}


const commonProcessStartGame = async ({ roomId, gameId, userId, io, socket }: { roomId: string, gameId: string, userId: string, io: any, socket: any }) => {
    fromAvailableToActive(roomId);
    emitStatus({ io, socket, roomId, message: "Game started", duration: roomData[roomId]?.duration, step: 2 });
    await Rooms.create({
        gameId,
        roomId,
        userIds: roomData[roomId]?.userIds,
        scores: roomData[roomId]?.scores,
        joinedAt: roomData[roomId]?.joinedAt,
        disconnectedAt: roomData[roomId]?.disconnectedAt,
        status: "active",
        startTime: new Date(),
        aiPlay: roomData[roomId]?.userIds.length === 1 ? true : false
    });

    clearTimer(roomId);

    startTimer(roomId, 2, 'gameComplete', roomData[roomId]?.duration, async () => {
        emitStatus({ io, socket, roomId, message: "Game over", duration: 0, step: 3 });
        await Rooms.update({
            // userIds: roomData[roomId]?.userIds,
            scores: roomData[roomId]?.scores,
            // joinedAt: roomData[roomId]?.joinedAt,
            disconnectedAt: roomData[roomId]?.disconnectedAt,
            status: "finished",
            endTime: Date.now()
        }, {
            where: {
                roomId,
                status: "active"
            }
        });
        clearTimer(roomId);
        delete roomData[roomId];
        activeRooms = activeRooms.filter((item) => item !== roomId);
        availableRooms = availableRooms.filter((item) => item !== roomId);
        gameData[gameId] = gameData[gameId]?.filter((item) => item !== roomId);
    })
}

const emitStatus = ({ io, socket, roomId, message, duration, step }: { io: any, socket: any, roomId: string, message: string, duration: number, step: number }) => {
    socket.join(roomId);
    io.to(roomId).emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: roomData[roomId], status: { message, duration, step }, success: true })
}

const fromAvailableToActive = (roomId: string) => {
    const availableIndex = availableRooms.indexOf(roomId);
    if (availableIndex !== -1) {
        availableRooms.splice(availableIndex, 1);
    }
    if (!activeRooms.includes(roomId)) {
        activeRooms.push(roomId);
    }
}

export const rejoinGame = ({ io, socket, roomId }: { io: any, socket: Socket, roomId: string }) => {
    let timerData = checkTimer(roomId);
    emitStatus({ io, socket, roomId, message: "Player rejoined", duration: roomData[roomId]?.duration, step: timerData.step });
}