import { checkIfGameActive, checkIfRoomAvailable, createNewAvailableRoom, createNewGame, rejoinGame, updateAvailableRoom, updateScore } from "../../data/gameData";
import { Server, Socket } from "socket.io";

const roomHandlers = (io: Server, socket: Socket) => {
    console.log(1)

    socket.on("GET_AVAILABLE_ROOMS", ({ gameId, totalSlots, duration }) => {
        console.log(1)
        let checkGame = checkIfGameActive(gameId);
        if (checkGame) {
            console.log(2, checkGame)
            let checkRoom = checkIfRoomAvailable(gameId);
            if (checkRoom) {
                console.log(3, checkRoom)
                updateAvailableRoom({ gameId, roomId: checkRoom, userId: socket.data.user.userId, io, socket });
            } else {
                console.log(4)
                createNewAvailableRoom({ gameId, totalSlots, userId: socket.data.user.userId, duration, io, socket });
            }
        } else {
            console.log(5)
            createNewGame({ gameId, totalSlots, userId: socket.data.user.userId, duration: duration, io: io, socket: socket });
        }
    })

    socket.on("UPDATE_SCORES", ({ roomId, userId, score }) => {
        updateScore({ io, socket, roomId, userId, score })
    })

    socket.on("REJOIN_GAME", (roomId) => {
        rejoinGame({io, socket, roomId});
    })
};

export default roomHandlers;
