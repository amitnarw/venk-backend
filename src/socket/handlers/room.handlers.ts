import { checkIfGameActive, checkIfRoomAvailable, createNewAvailableRoom, createNewGame, updateAvailableRoom } from "../../data/gameData";
import { Server, Socket } from "socket.io";

const roomHandlers = (io: Server, socket: Socket) => {
    console.log(1)

    socket.on("GET_AVAILABLE_ROOMS", async ({ gameId, totalSlots, duration }) => {
        console.log(1)
        let checkGame = checkIfGameActive(gameId);
        if (checkGame) {
            console.log(2, checkGame)
            let checkRoom = checkIfRoomAvailable(gameId);
            if (checkRoom) {
                console.log(3, checkRoom)
                let updateRoom = await updateAvailableRoom({gameId: gameId, roomId: checkRoom, userId: socket.data.user.userId});
                socket.join(updateRoom?.roomId);
                io.to(updateRoom?.roomId).emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: updateRoom, success: true });
                // socket.emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: updateRoom, success: true });
            } else {
                console.log(4)
                let createRoom = createNewAvailableRoom({gameId: gameId, totalSlots: totalSlots, userId: socket.data.user.userId, duration: duration});
                socket.join(createRoom?.roomId);
                io.to(createRoom?.roomId).emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: createRoom, success: true });
                // socket.emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: createRoom, success: true });
            }
        } else {
            console.log(5)
            let createGame = createNewGame({gameId: gameId, totalSlots: totalSlots, userId: socket.data.user.userId, duration: duration});
            socket.join(createGame?.roomId)
            io.to(createGame?.roomId).emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: createGame, success: true })
            // socket.emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: createGame, success: true });
        }
    })
};

export default roomHandlers;
