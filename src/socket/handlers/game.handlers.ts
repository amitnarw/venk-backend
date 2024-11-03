import { Server, Socket } from "socket.io";
import { GAME_START, GAME_UPDATE, GAME_OVER } from "../events";

const gameHandlers = (io: Server, socket: Socket) => {
    socket.on(GAME_START, (data) => {
        const { roomId } = data;
        io.to(roomId).emit("gameStarted", { roomId, message: "Game has started!" });
        console.log(`Game started in room ${roomId}`);
    });

    socket.on(GAME_UPDATE, (data) => {
        const { roomId, scores } = data;
        io.to(roomId).emit("gameUpdated", { roomId, scores });
    });

    socket.on(GAME_OVER, (data) => {
        const { roomId, results } = data;
        io.to(roomId).emit("gameOver", { roomId, results });
        console.log(`Game over in room ${roomId}`);
    });
};

export default gameHandlers;
