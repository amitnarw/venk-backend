import { Server } from "socket.io";
import gameHandlers from "./handlers/game.handlers";
import roomHandlers from "./handlers/room.handlers";

const socketSetup = (io: Server) => {
    io.on("connection", (socket) => {
        console.log('user connected', socket.id);
        
          roomHandlers(io, socket);
          gameHandlers(io, socket);

        socket.on("disconnect", ()=>{
            console.log("User disconnect", socket.id);
        })
    })
}

export default socketSetup;