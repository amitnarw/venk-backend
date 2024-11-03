import { Server, Socket } from "socket.io";
import { ROOM_CREATED, JOIN_ROOM, ROOM_JOINED } from "../events";

const roomHandlers = (io: Server, socket: Socket) => {
    socket.on(ROOM_CREATED, (data) => {
        const { gameId, roomId, userId } = data;

        // Emit event to the room that the room has been created
        io.emit("roomCreated", { gameId, roomId, remainingSlots: 4, userIds: [userId], scores: [0], joinedAt: [new Date()] });
        console.log(`Room created with roomId: ${roomId}`);
    });

    socket.on(JOIN_ROOM, (data) => {
        const { roomId, userId } = data;
        
        // Perform checks and update room information here
        io.emit(ROOM_JOINED, { roomId, userId });
        console.log(`User ${userId} joined room ${roomId}`);
    });
};

export default roomHandlers;
