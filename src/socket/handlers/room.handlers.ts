import { Server, Socket } from "socket.io";
import { ROOM_CREATED, JOIN_ROOM, ROOM_JOINED } from "../events";
import { Room } from "../../types/socketTypes";

const roomsData: { [gameId: string]: Room[] } = {};

const roomHandlers = (io: Server, socket: Socket) => {
        // Room Creation Handler
    socket.on(ROOM_CREATED, (data) => {
        const { gameId, roomId, userId, totalSlots } = data;

        const newRoom: Room = {
            roomId,
            remainingSlots: totalSlots - 1,
            userIds: [userId],
            scores: [0],
            joinedAt: [new Date()]
        };

        if (!roomsData[gameId]) {
            roomsData[gameId] = [];
        }

        roomsData[gameId].push(newRoom);

        io.to(gameId).emit("roomCreated", { gameId, ...newRoom });
        console.log(`Room created with roomId: ${roomId} for gameId: ${gameId}`);
    });

    // Room Join Handler
    socket.on(JOIN_ROOM, (data) => {
        const { gameId, roomId, userId } = data;

        const room = roomsData[gameId]?.find(r => r.roomId === roomId);

        if (room && room.remainingSlots > 0) {
            room.userIds.push(userId);
            room.scores.push(0);
            room.joinedAt.push(new Date());
            room.remainingSlots -= 1;

            io.to(gameId).emit(ROOM_JOINED, { gameId, roomId, userId });
            console.log(`User ${userId} joined room ${roomId} in game ${gameId}`);
        } else {
            console.log(`No available slots in room ${roomId} for game ${gameId}`);
        }
    });
};

export default roomHandlers;
