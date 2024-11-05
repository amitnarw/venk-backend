import { Server, Socket } from "socket.io";
import { v4 as uuid_v4 } from 'uuid';
import { Room } from "../../types/socketTypes";

const activeGames: string[] = [];
const activeRooms: Room[] = [];

const roomHandlers = (io: Server, socket: Socket) => {
    // Room Creation Handler
    console.log(1)
    //     socket.on("ROOM_CREATED", (data) => {
    //     console.log(2)
    //     const { gameId, roomId, userId, totalSlots } = data;

    //     const newRoom: Room = {
    //         roomId,
    //         remainingSlots: totalSlots - 1,
    //         userIds: [userId],
    //         scores: [0],
    //         joinedAt: [new Date()]
    //     };

    //     if (!roomsData[gameId]) {
    //         roomsData[gameId] = [];
    //     }

    //     roomsData[gameId].push(newRoom);

    //     io.to(gameId).emit("roomCreated", { gameId, ...newRoom });
    //     console.log(`Room created with roomId: ${roomId} for gameId: ${gameId}`);
    // });

    // // Room Join Handler
    // socket.on("JOIN_ROOM", (data) => {
    //     console.log(3)
    //     const { gameId, roomId, userId } = data;

    //     const room = roomsData[gameId]?.find(r => r.roomId === roomId);

    //     if (room && room.remainingSlots > 0) {
    //         room.userIds.push(userId);
    //         room.scores.push(0);
    //         room.joinedAt.push(new Date());
    //         room.remainingSlots -= 1;

    //         io.to(gameId).emit("ROOM_JOINED", { gameId, roomId, userId });
    //         console.log(`User ${userId} joined room ${roomId} in game ${gameId}`);
    //     } else {
    //         console.log(`No available slots in room ${roomId} for game ${gameId}`);
    //     }
    // });


    const addNewRoom = (gameId: string, totalSlots: number, userId:string) => {
        activeGames.push(gameId);
            activeRooms.push({
                gameId,
                roomId: `roomId-${uuid_v4()}`,
                remainingSlots: totalSlots - 1,
                userIds: [userId],
                scores: [0],
                joinedAt: [new Date()],
            })
    }

    socket.on("CHECK_ROOM", ({ gameId, totalSlots, userId }) => {
        if (activeGames.includes(gameId)) {
            if (activeRooms[activeGames.indexOf(gameId)].remainingSlots > 0) {
                activeRooms[activeGames.indexOf(gameId)].remainingSlots - 1,
                activeRooms[activeGames.indexOf(gameId)].userIds.push(userId),
                activeRooms[activeGames.indexOf(gameId)].scores.push(0),
                activeRooms[activeGames.indexOf(gameId)].joinedAt.push(new Date())
            } else {
                addNewRoom(gameId, totalSlots, userId);
            }

        } else {
            addNewRoom(gameId, totalSlots, userId);
        }

        

        socket.emit("ROOMS_DATA", [
            { gameId: 11 }
        ]);
    })
};

export default roomHandlers;
