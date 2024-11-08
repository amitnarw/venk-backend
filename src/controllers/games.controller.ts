import { Request, Response } from "express"
import { v4 as uuid_v4 } from 'uuid';
import { Games } from "../db/models"
import { sendError, sendSuccess } from "../utils/handleResponse";
import { ERROR_CODES } from "../utils/handleErrorCode";

export const getAllGames = async (req: Request, res: Response) => {
    try {
        let resp = await Games.findAndCountAll();
        return sendSuccess(res, 200, resp);
    } catch (err) {
        return sendError(res, 500, `Error while getting all games data: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const getSingleGame = async (req: Request, res: Response) => {
    try {
        let { gameId } = await req.body;
        if (!gameId || gameId === "") {
            return sendError(res, 400, `Please provide gameId`, ERROR_CODES.MISSING_FIELD);
        }
        let resp = await Games.findOne({
            where: {
                gameId
            }
        });
        return sendSuccess(res, 200, resp);
    } catch (err) {
        return sendError(res, 500, `Error while getting single game data: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const createGame = async (req: Request, res: Response) => {
    try {
        let { image, name, description, duration, maxPlayers } = await req.body;
        if (!name || name === "" || !description || description === "" || !duration || duration === "" || !maxPlayers || maxPlayers === "") {
            return sendError(res, 400, `Please provide name, description, duration and maxPlayers`, ERROR_CODES.MISSING_FIELD);
        }
        const gameId = `gameId-${uuid_v4()}`;
        await Games.create({
            gameId,
            image,
            name,
            description,
            duration,
            maxPlayers
        });
        return sendSuccess(res, 200, gameId);
    } catch (err) {
        return sendError(res, 500, `Error while creating new game: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}