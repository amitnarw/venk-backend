import { Server } from "socket.io";

const socketSetup = (io: Server) => {
    io.on("connection", (socket) => {
        console.log('user connected', socket.id);


    })
}

export default socketSetup;