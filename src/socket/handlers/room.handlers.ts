import { SocketError } from "../../types/socketTypes";
import { checkIfGameActive, checkIfRoomAvailable, checkUserBalance, createNewAvailableRoom, createNewGame, rejoinGame, updateAvailableRoom, updateScore } from "../../data/gameData";
import { Server, Socket } from "socket.io";

const roomHandlers = (io: Server, socket: Socket) => {
    console.log(1)

    socket.on("GET_AVAILABLE_ROOMS", async ({ gameId, totalSlots, duration, bet }) => {
        console.log(6)
        if(!gameId || !totalSlots || !duration || !bet){
            socket.emit("FIELDS_ERROR", { statusCode: 200, message: 'Please send gameId, totalSlotsm duration and bet value', success: false });
            return;
        }

        let checkBalance = await checkUserBalance({ userId: socket.data.user.userId, bet: bet })

        if (checkBalance) {
            let checkGame = await checkIfGameActive(gameId);
            if (checkGame) {
                console.log(2, checkGame)
                let checkRoom = await checkIfRoomAvailable(gameId, bet);
                console.log(checkRoom, '-----checkRoom------')
                if (checkRoom) {
                    console.log(3, checkRoom)
                    updateAvailableRoom({ gameId, roomId: checkRoom, userId: socket.data.user.userId, io, socket, bet });
                } else {
                    console.log(4)
                    createNewAvailableRoom({ gameId, totalSlots, userId: socket.data.user.userId, duration, io, socket, bet });
                }
            } else {
                console.log(5)
                createNewGame({ gameId, totalSlots, userId: socket.data.user.userId, duration: duration, io: io, socket: socket, bet });
            }
        } else {
            socket.emit("BALANCE_ERROR", { statusCode: 200, message: 'Low balance', success: false, });
            return;
        }

    })

    socket.on("UPDATE_SCORES", ({ roomId, userId, score }) => {
        if (!roomId || !userId || !score) {
            socket.emit("error", { message: "Missing roomId OR userId OR score" });
            return;
        }
        updateScore({ io, socket, roomId, userId, score })
    })

    socket.on("REJOIN_GAME", (roomId) => {
        if (!roomId) {
            socket.emit("error", { message: "Missing roomId" });
            return;
        }
        rejoinGame({ io, socket, roomId });
    })
};

export default roomHandlers;
