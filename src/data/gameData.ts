import { v4 as uuid_v4 } from 'uuid';
import { createNewGameAttributes, GameData, RoomData, updateAvailableRoomAttributes } from "../types/socketTypes";
import { Rooms, Users } from '../db/models';
import { checkTimer, clearTimer, startTimer } from '../utils/timerManager';
import { Socket } from 'socket.io';
import { aiData } from '../utils/demoAiData';
import sequelize from '../db/dbConnect';
import { Op } from 'sequelize';

let activeGames: string[] = [];
let availableRooms: string[] = [];
let activeRooms: string[] = [];

let connectedUserIds: string[] = []

let gameData: GameData = {}
let roomData: RoomData = {}

const getAllActiveGames = () => {
    return activeGames;
}

const getAllActiveRooms = () => {
    return activeRooms;
}

const getAllAvailableRooms = () => {
    return availableRooms;
}

const checkIfGameActive = (gameId: string) => {
    return activeGames.includes(gameId);
}

const checkIfRoomActive = (roomId: string) => {
    return activeRooms.includes(roomId);
}

const checkIfRoomAvailable = (gameId: string, bet: number) => {
    const roomId = gameData[gameId].find(roomId => {
        console.log(availableRooms.includes(roomId), roomData[roomId].bet === bet, roomData[roomId].bet, bet, '0000000000000000');
        return availableRooms.includes(roomId) && roomData[roomId].bet === bet;
    });

    return roomId || null;
}

const isUserInAnyRoom = (userId: string) => {
    let returnData = {
        success: false,
        index: -1,
        data: {},
        statusCode: 400
    };
    Object.values(roomData).some((roomDetails, index) => {
        let check = roomDetails.userIds.includes(userId);
        if (check) {
            returnData = {
                success: true,
                index: index,
                data: roomDetails,
                statusCode: 200
            }
        }
    });
    return returnData;
};

const getAllRoomsOfGame = (gameId: string) => {
    return gameData[gameId]
}

const getDataOfRoom = (roomId: string) => {
    return roomData[roomId]
}

const totalSlotsInRoom = (roomId: string) => {
    return roomData[roomId].totalSlots;
}

const remainingSlotsInRoom = (roomId: string) => {
    return roomData[roomId].remainingSlots;
}

const updateScore = ({ io, socket, roomId, userId, score }: { io: any, socket: any, roomId: string, userId: string, score: number }) => {
    let index = roomData[roomId].userIds.indexOf(userId);
    roomData[roomId].scores[index] = score;
    // emitStatus({ io, socket, roomId, message: "Score updated", duration: roomData[roomId]?.duration, step: 2 });
}

const updateAvailableRoom = async ({ gameId, roomId, userId, io, socket, bet }: updateAvailableRoomAttributes) => {
    roomData[roomId].remainingSlots -= 1;
    roomData[roomId].userIds.push(userId);
    roomData[roomId].scores.push(0);
    roomData[roomId].joinedAt.push(new Date());
    roomData[roomId].disconnectedAt.push(0);
    let userData = await Users.findOne({
        where: {
            userId
        },
        attributes: ["userId", "img", "firstName", "lastName", "email"]
    });
    roomData[roomId].userDetails.push(userData);
    if (roomData[roomId].remainingSlots === 0) {
        // fromAvailableToActive(roomId);
        clearTimer(roomId);
        commonProcessStartGame({ roomId, gameId, userId, io, socket, bet });
    } else {
        emitStatus({ io, socket, roomId, message: `New player joined, waiting for ${roomData[roomId].remainingSlots} players`, duration: 20000, step: 1 });
    }
}

const createNewAvailableRoom = async ({ gameId, totalSlots, userId, duration, io, socket, bet }: createNewGameAttributes) => {
    const roomId = `roomId-${uuid_v4()}`;
    availableRooms.push(roomId);
    gameData[gameId].push(roomId);
    let userData = await Users.findOne({
        where: {
            userId
        },
        attributes: ["userId", "img", "firstName", "lastName", "email"]
    });
    let newData = {
        roomId,
        gameId,
        duration,
        remainingSlots: totalSlots - 1,
        totalSlots,
        userIds: [userId],
        userDetails: [userData],
        scores: [0],
        joinedAt: [new Date()],
        disconnectedAt: [0],
        bet: bet
    }
    roomData[roomId] = newData;
    commonProcessWaiting({ roomId, gameId, userId, io, socket, bet });
}

const createNewGame = async ({ gameId, totalSlots, userId, duration, io, socket, bet }: createNewGameAttributes) => {
    const roomId = `roomId-${uuid_v4()}`;
    activeGames.push(gameId);
    availableRooms.push(roomId);
    gameData[gameId] = [roomId];
    let userData = await Users.findOne({
        where: {
            userId
        },
        attributes: ["userId", "img", "firstName", "lastName", "email"]
    });
    let newData = {
        roomId,
        gameId,
        duration,
        remainingSlots: totalSlots - 1,
        totalSlots,
        userIds: [userId],
        userDetails: [userData],
        scores: [0],
        joinedAt: [new Date()],
        disconnectedAt: [0],
        bet: bet,
    }
    roomData[roomId] = newData;
    commonProcessWaiting({ roomId, gameId, userId, io, socket, bet });
}

const commonProcessWaiting = ({ roomId, gameId, userId, io, socket, bet }: { roomId: string, gameId: string, userId: string, io: any, socket: any, bet: number }) => {

    emitStatus({ io, socket, roomId, message: `Room created, waiting for ${roomData[roomId].remainingSlots} players`, duration: 20000, step: 1 });
    startTimer(roomId, 1, 'timeout', 20000,
        async () => {
            commonProcessStartGame({ roomId, gameId, userId, io, socket, bet });
        }, io);
}


const commonProcessStartGame = async ({ roomId, gameId, userId, io, socket, bet }: { roomId: string, gameId: string, userId: string, io: any, socket: any, bet: number }) => {

    for (const roomId in roomData) {
        if (roomData.hasOwnProperty(roomId)) {
            const room = roomData[roomId];
            // Keep AI players intact while filtering
            const filteredUserIds = room.userIds.filter(userId => 
                connectedUserIds.includes(userId) || userId.startsWith('ai-')
            );
            room.userIds = filteredUserIds;
            room.scores = room.scores.filter((_, index) => filteredUserIds.includes(room.userIds[index]));
            room.joinedAt = room.joinedAt.filter((_, index) => filteredUserIds.includes(room.userIds[index]));
            room.disconnectedAt = room.disconnectedAt.filter((_, index) => filteredUserIds.includes(room.userIds[index]));
            room.userDetails = room.userDetails.filter(user => 
                connectedUserIds.includes(user.userId) || user.userId.startsWith('ai-')
            );
        }
    }

    if (roomData[roomId]?.userIds.length > 0) {
        fromAvailableToActive(roomId);

        if (roomData[roomId]?.userIds.length === 1) {
            // Add AI player if only one player exists after 20 seconds
            let getAiData = aiData[Math.floor(Math.random() * aiData.length)];
            roomData[roomId].remainingSlots -= 1;
            roomData[roomId].userIds.push(getAiData.userId);
            roomData[roomId].scores.push(0);
            roomData[roomId].joinedAt.push(new Date());
            roomData[roomId].disconnectedAt.push(0);
            roomData[roomId].userDetails.push(getAiData);

            const transaction = await sequelize.transaction();
            emitStatus({ io, socket, roomId, message: "Game started", duration: roomData[roomId]?.duration, step: 2, aiPlay: true });

            try {
                await Rooms.create({
                    gameId,
                    roomId,
                    userIds: roomData[roomId]?.userIds,
                    scores: roomData[roomId]?.scores,
                    joinedAt: roomData[roomId]?.joinedAt,
                    disconnectedAt: roomData[roomId]?.disconnectedAt,
                    status: "active",
                    startTime: new Date(),
                    aiPlay: true,
                    winnerUserId: 0,
                    bet: bet,
                    winAmount: 0
                }, { transaction });

                await Users.update(
                    {
                        balance: sequelize.literal(`balance - ${bet}`)
                    },
                    {
                        where: {
                            userId: {
                                [Op.in]: roomData[roomId]?.userIds
                            }
                        },
                        transaction
                    }
                );
                await transaction.commit();
            } catch (err) {
                await transaction.rollback();
            }
        } else {
            // Start game with two real players
            emitStatus({ io, socket, roomId, message: "Game started", duration: roomData[roomId]?.duration, step: 2, aiPlay: false });
            const transaction = await sequelize.transaction();

            try {
                await Rooms.create({
                    gameId,
                    roomId,
                    userIds: roomData[roomId]?.userIds,
                    scores: roomData[roomId]?.scores,
                    joinedAt: roomData[roomId]?.joinedAt,
                    disconnectedAt: roomData[roomId]?.disconnectedAt,
                    status: "active",
                    startTime: new Date(),
                    aiPlay: false,
                    winnerUserId: 0,
                    bet: bet,
                    winAmount: 0
                }, { transaction });

                await Users.update(
                    {
                        balance: sequelize.literal(`balance - ${bet}`)
                    },
                    {
                        where: {
                            userId: {
                                [Op.in]: roomData[roomId]?.userIds
                            }
                        },
                        transaction
                    }
                );
                await transaction.commit();
            } catch (err) {
                await transaction.rollback();
            }
        }

        // Start game timer
        clearTimer(roomId);
        startTimer(roomId, 2, 'gameComplete', roomData[roomId]?.duration, async () => {
            let winnerUserId =
                roomData[roomId]?.scores[0] === roomData[roomId]?.scores[1]
                    ? "0"
                    : roomData[roomId]?.scores[0] > roomData[roomId]?.scores[1]
                        ? roomData[roomId]?.userIds[0]
                        : roomData[roomId]?.userIds[1];

            let winningAmount =
                roomData[roomId]?.scores[0] === roomData[roomId]?.scores[1]
                    ? bet
                    : bet * roomData[roomId]?.userIds.length;

            emitStatus({
                io,
                socket,
                roomId,
                message: "Game over",
                duration: 0,
                step: 3,
                winnerUserId: winnerUserId,
                winAmount: winningAmount
            });

            const transaction = await sequelize.transaction();

            try {
                await Rooms.update({
                    scores: roomData[roomId]?.scores,
                    disconnectedAt: roomData[roomId]?.disconnectedAt,
                    status: "finished",
                    endTime: Date.now(),
                    winnerUserId: winnerUserId,
                    winAmount: winningAmount
                }, {
                    where: {
                        roomId,
                        status: "active"
                    },
                    transaction
                });

                if (winnerUserId === "0") {
                    // Draw: distribute the winning amount equally
                    await Users.update(
                        {
                            balance: sequelize.literal(`balance + ${winningAmount}`)
                        },
                        {
                            where: {
                                userId: {
                                    [Op.in]: roomData[roomId]?.userIds
                                }
                            },
                            transaction
                        }
                    );
                } else {
                    // Win: credit winning amount to the winner
                    await Users.update(
                        {
                            balance: sequelize.literal(`balance + ${winningAmount}`)
                        },
                        {
                            where: {
                                userId: winnerUserId
                            },
                            transaction
                        }
                    );
                }
                await transaction.commit();
            } catch (err) {
                await transaction.rollback();
            }

            clearTimer(roomId);
            delete roomData[roomId];
            activeRooms = activeRooms.filter(item => item !== roomId);
            availableRooms = availableRooms.filter(item => item !== roomId);
            gameData[gameId] = gameData[gameId]?.filter(item => item !== roomId);
        }, io);
    } else {
        // Handle case where no players left in the game
        clearTimer(roomId);
        delete roomData[roomId];
        activeRooms = activeRooms.filter(item => item !== roomId);
        availableRooms = availableRooms.filter(item => item !== roomId);
        gameData[gameId] = gameData[gameId]?.filter(item => item !== roomId);
        emitStatus({
            io,
            socket,
            roomId,
            message: "All players left the game. Game Over",
            duration: 0,
            step: 3
        });
    }
};


const emitStatus = ({ io, socket, roomId, message, duration, step, aiPlay, winnerUserId, winAmount }: { io: any, socket: any, roomId: string, message: string, duration: number, step: number, aiPlay?: boolean, winnerUserId?: string, winAmount?: number }) => {
    socket.join(roomId);
    if (step === 3) {
        console.log(roomData[roomId], '222222222222222')
        io.to(roomId).emit("MATCH_OVER", { statusCode: 200, data: roomData[roomId], status: { message, duration, step, winnerUserId, winAmount }, success: true, aiPlay })
    } else {
        io.to(roomId).emit("GET_AVAILABLE_ROOMS", { statusCode: 200, data: roomData[roomId], status: { message, duration, step, winnerUserId, winAmount }, success: true, aiPlay })
    }
}

const fromAvailableToActive = (roomId: string) => {
    const availableIndex = availableRooms.indexOf(roomId);
    if (availableIndex !== -1) {
        availableRooms.splice(availableIndex, 1);
    }
    if (!activeRooms.includes(roomId)) {
        activeRooms.push(roomId);
    }
}

const rejoinGame = ({ io, socket, roomId }: { io: any, socket: Socket, roomId: string }) => {
    let timerData = checkTimer(roomId);
    emitStatus({ io, socket, roomId, message: "Player rejoined", duration: roomData[roomId]?.duration, step: timerData.step });
}

const addConnectedUserInList = (userId: string) => {
    connectedUserIds.push(userId);
    Object.values(roomData).some((roomDetails) => {
        let check = roomDetails.userIds.includes(userId);
        let userIndex = roomDetails.userIds.indexOf(userId);
        if (check) {
            roomDetails.disconnectedAt[userIndex] = 0;
        }
    });
}

const removeDisconnectUserBeforeStart = ({ io, socket, userId }: { io: any, socket: Socket, userId: string }) => {
    let userIndex = connectedUserIds.indexOf(userId);
    if (userIndex !== -1) {
        connectedUserIds.splice(userIndex, 1);
    }
    Object.values(roomData).some((roomDetails) => {
        let check = roomDetails.userIds.includes(userId);
        let userIndex = roomDetails.userIds.indexOf(userId);
        if (check) {
            roomDetails.disconnectedAt[userIndex] = new Date();
        }
    });
}


// Object.values(roomData).some((roomDetails) => {
//     let check = roomDetails.userIds.includes(userId);
//     if (check) {
//         let roomId = roomDetails.roomId;
//         let timerData = checkTimer(roomDetails.roomId);
//         if (timerData.step === 1) {
//             let userIndex = roomData[roomId].userIds.indexOf(userId);
//             if (userIndex !== -1) {
//                 roomData[roomId].userIds.splice(userIndex, 1)
//                 roomData[roomId].remainingSlots += 1;
//                 roomData[roomId].scores.splice(userIndex, 1);
//                 roomData[roomId].joinedAt.splice(userIndex, 1);
//                 roomData[roomId].disconnectedAt.splice(userIndex, 1);
//             }
//             // emitStatus({ io, socket, roomId, message: "Player disconnected", duration: roomData[roomId]?.duration, step: timerData.step });
//         }
//     }
// });


const checkUserBalance = async ({ userId, bet }: { userId: string, bet: number }) => {
    try {
        let userData = await Users.findOne({
            where: {
                userId
            },
            attributes: ["balance"]
        });
        if (!userData) return false;
        return bet <= userData?.dataValues?.balance
    } catch (err) {
        console.log(err, 'xxxxxxxxERRORxxxxxxxxxx')
    }
}


export {
    getAllActiveGames,
    getAllActiveRooms,
    getAllAvailableRooms,
    checkIfGameActive,
    checkIfRoomActive,
    checkIfRoomAvailable,
    isUserInAnyRoom,
    getAllRoomsOfGame,
    getDataOfRoom,
    totalSlotsInRoom,
    remainingSlotsInRoom,
    updateScore,
    updateAvailableRoom,
    createNewAvailableRoom,
    createNewGame,
    rejoinGame,
    addConnectedUserInList,
    removeDisconnectUserBeforeStart,
    checkUserBalance
}