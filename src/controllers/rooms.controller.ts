import { Request, Response } from "express"
import { v4 as uuid_v4 } from 'uuid';
import { sendError, sendSuccess } from "../utils/handleResponse";
import { ERROR_CODES } from "../utils/handleErrorCode";
import { Games, Rooms } from "../db/models";
import { Op } from "sequelize";
import sequelize from "../db/dbConnect";
import { AuthenticatedRequest } from "../types/common";

export const getAllRooms = async (req: Request, res: Response) => {
    try {

    } catch (err) {
        return sendError(res, 500, `Error while getting all games data: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const getSingleRoom = async (req: Request, res: Response) => {
    try {
        let { roomId } = await req.body();
        let resp = await Rooms.findOne({
            where: {
                roomId
            }
        });
        return sendSuccess(res, 200, resp);
    } catch (err) {
        return sendError(res, 500, `Error while getting all games data: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const createRoom = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        let { gameId, status, userId } = await req.body;
        if (!gameId || gameId === "" || !status || status === "" || !userId || userId === "") {
            return sendError(res, 400, `Please provide gameId, status and userId`, ERROR_CODES.MISSING_FIELD);
        }
        const validStatus = ['waiting', 'active', 'finished'];
        if (!validStatus.includes(status)) {
            return sendError(res, 400, 'Invalid status value. Allowed values are: waiting, active, finished', ERROR_CODES.INVALID_VALUE);
        }

        // const existingActiveRoom = await GamesActive.findOne({
        //     where: {
        //         userIds: {
        //             [Op.contains]: [userId]
        //         }
        //     },
        //     transaction
        // });
        // if (existingActiveRoom) {
        //     await transaction.rollback();
        //     return sendError(res, 400, "User already has an active room", ERROR_CODES.USER_ALREADY_EXISTS);
        // }

        const roomId = `roomId-${uuid_v4()}`;
        await Rooms.create({
            roomId,
            gameId,
            status
        }, { transaction });

        // await GamesActive.create({
        //     roomId,
        //     userIds: [userId],
        //     scores: [0],
        //     joinedAt: [new Date()],
        //     disconnectedAt: [0]
        // }, { transaction });

        await transaction.commit();
        return sendSuccess(res, 200, roomId);
    } catch (err) {
        await transaction.rollback();
        return sendError(res, 500, `Error while getting all games data: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const alreadyPlaying = async (req: AuthenticatedRequest, res: Response) => {
    try {
        let userId = req.userId;
        if (!userId || userId === "") {
            return sendError(res, 400, `Please provide userId`, ERROR_CODES.MISSING_FIELD);
        }
        let resp: any = await Rooms.findOne({
            where: {
                status: 'active',
                userIds: {
                    [Op.contains]: [userId]
                }
            },
            include: [
                {
                    model: Games
                }
            ]
        });
        let response;
        if (resp?.roomId) {
            response = {
                playing: true,
                roomId: resp.roomId,
                gameDetails: resp.game
            }
        } else {
            response = {
                playing: false,
            }
        }
        return sendSuccess(res, 200, response);
    } catch (err) {
        return sendError(res, 500, `Error while checking if already playing: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}