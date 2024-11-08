import { Server } from "socket.io";
import gameHandlers from "./handlers/game.handlers";
import roomHandlers from "./handlers/room.handlers";
import { validateSocket } from "./middleware";
import alreadyInRoomHandler from "./handlers/alreadyInRoom.handlers";

const socketSetup = (io: Server) => {
    io.use(validateSocket);
    io.on("connection", (socket) => {
        console.log('user connected', socket.data.user.userId);

        alreadyInRoomHandler(io, socket);
        roomHandlers(io, socket);
        gameHandlers(io, socket);

        socket.on("disconnect", () => {
            console.log("User disconnect", socket.id);
        })
    })
}

export default socketSetup;