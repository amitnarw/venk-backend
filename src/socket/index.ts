import { Server } from "socket.io";
import gameHandlers from "./handlers/game.handlers";
import roomHandlers from "./handlers/room.handlers";
import { validateSocket } from "./middleware";
import alreadyInRoomHandler from "./handlers/alreadyInRoom.handlers";
import { addConnectedUserInList, removeDisconnectUserBeforeStart } from "../data/gameData";

const socketSetup = (io: Server) => {
    console.log('2', '======================================')
    io.use(validateSocket);
    io.on("connection", async (socket) => {
        console.log('++user connected++', socket.data.user.userId, socket.id);
        addConnectedUserInList(socket.data.user.userId);

        await alreadyInRoomHandler(io, socket);
        roomHandlers(io, socket);
        gameHandlers(io, socket);

        socket.on("disconnect", () => {
            console.log("xxUser disconnectxx", socket.id);
            removeDisconnectUserBeforeStart({ io, socket, userId: socket.data.user.userId });
        })
    })
}

export default socketSetup;