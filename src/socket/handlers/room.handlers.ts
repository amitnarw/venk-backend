import { checkIfGameActive, checkIfRoomAvailable, createNewAvailableRoom, createNewGame, updateAvailableRoom } from "../../data/gameData";
import { Server, Socket } from "socket.io";

const roomHandlers = (io: Server, socket: Socket) => {
    console.log(1)
    socket.on("GET_AVAILABLE_ROOMS", ({ gameId, totalSlots }) => {
        console.log(1)
        let checkGame = checkIfGameActive(gameId);
        if (checkGame) {
            console.log(2)
            let checkRoom = checkIfRoomAvailable(gameId);
            if (checkRoom) {
                console.log(3)
                let updateRoom = updateAvailableRoom(checkRoom);
                socket.emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: checkRoom, success: true });
            } else {
                console.log(4)
                let createRoom = createNewAvailableRoom(gameId, totalSlots, socket.data.user.userId);
                socket.emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: createRoom, success: true });
            }
        } else {
            console.log(5)
            let createGame = createNewGame(gameId, totalSlots, socket.data.user.userId);
            socket.emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: createGame, success: true });
        }
    })

};

export default roomHandlers;
