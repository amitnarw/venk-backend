import { isUserInAnyRoom } from "../../data/gameData";
import { Server, Socket } from "socket.io"

const alreadyInRoomHandler = (io: Server, socket: Socket) => {

    socket.on("IS_USER_ALREADY_PLAYING", () => {
        let data = isUserInAnyRoom(socket.data.user.userId);
        socket.emit("IS_USER_ALREADY_PLAYING", data);
    })
}

export default alreadyInRoomHandler;