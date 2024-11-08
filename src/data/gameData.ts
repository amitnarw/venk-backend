import { v4 as uuid_v4 } from 'uuid';
import { GameData, RoomData } from "../types/socketTypes";
import { Rooms } from '../db/models';

const activeGames: string[] = [];
const availableRooms: string[] = [];
const activeRooms: string[] = [];

const gameData: GameData = {}
const roomData: RoomData = {}

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
    return Object.values(roomData).some(room => room.userIds.includes(userId));
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

export const updateAvailableRoom = async (gameId: string, roomId: string, userId: string) => {
    roomData[roomId].remainingSlots -= 1;
    if (roomData[roomId].remainingSlots === 0) {
        const availableIndex = availableRooms.indexOf(roomId);
        if (availableIndex !== -1) {
            availableRooms.splice(availableIndex, 1);
        }
        if (!activeRooms.includes(roomId)) {
            activeRooms.push(roomId);
            let saveData = await Rooms.create({
                gameId,
                roomId,
                userIds: roomData[roomId].userIds,
                scores: roomData[roomId].scores,
                joinedAt: roomData[roomId].joinedAt,
                disconnectedAt: roomData[roomId].disconnectedAt,
                status: "active",
                startTime: new Date()
            });
        }
    }
    return true;
}

export const createNewAvailableRoom = (gameId: string, totalSlots: number, userId: string) => {
    const roomId = `roomId-${uuid_v4()}`;
    availableRooms.push(roomId);
    gameData[gameId].push(roomId);
    let newData = {
        gameId,
        remainingSlots: totalSlots - 1,
        totalSlots,
        userIds: [userId],
        scores: [0],
        joinedAt: [new Date()],
        disconnectedAt: [0]
    }
    roomData.roomId = newData;
    return newData;
}

export const createNewGame = (gameId: string, totalSlots: number, userId: string) => {
    const roomId = `roomId-${uuid_v4()}`;
    activeGames.push(gameId);
    availableRooms.push(roomId);
    gameData.gameId = [roomId];
    let newData = {
        gameId,
        remainingSlots: totalSlots - 1,
        totalSlots,
        userIds: [userId],
        scores: [0],
        joinedAt: [new Date()],
        disconnectedAt: [0]
    }
    roomData.roomId = newData;
    return newData;
}