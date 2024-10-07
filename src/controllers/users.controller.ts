import { users } from "db/models";
import { Request, Response } from "express"
import { encryptPassword, verifyPassword } from "utils/handlePassword";
import { sendError, sendSuccess } from "utils/handleResponse";
import { generateToken } from "utils/handleToken";
import { ERROR_CODES } from "utils/handleErrorCode";
import { Op } from "sequelize";
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env' });

export const userRegister = async (req: Request, res: Response) => {
    try {
        const { gameId, firstName, lastName, email, password, phone, dob } = req.body;
        const requiredFields = ['gameId', 'firstName', 'lastName', 'email', 'password', 'phone', 'dob'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                sendError(res, 400, `Missing required field: ${field}`, ERROR_CODES.MISSING_FIELD);

            }
        }

        let refreshToken = await generateToken(gameId, "refresh");
        let securedPassword = await encryptPassword(password);

        if (!refreshToken.success) {
            sendError(res, 500, `Error while generating refresh token: ${refreshToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
        }

        if (!securedPassword.success) {
            sendError(res, 500, `Error while encrypting password: ${securedPassword.error}`, ERROR_CODES.PASSWORD_ENCRYPTION_FAILED);
        }

        await users.create({
            gameId, firstName, lastName, email, password: securedPassword.password as string, phone, dob, refreshToken: refreshToken.token
        });

        let accessToken = await generateToken(gameId, "access");
        if (!accessToken.success) {
            sendError(res, 500, `Error while generating access token: ${accessToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
        }

        const cookieMaxAge = process.env.COOKIE_MAX_AGE ? parseInt(process.env.COOKIE_MAX_AGE) : 60 * 60 * 1000;
        res.cookie('accessToken', accessToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge,
            sameSite: 'strict'
        });

        let response = { gameId, firstName, lastName, accessToken: accessToken.token }
        sendSuccess(res, 200, response);
    } catch (err) {
        sendError(res, 500, `Error while registering new user: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const userLogin = async (req: Request, res: Response) => {
    try {
        const { gameId, email, password } = req.body;
        if (!gameId && !email) {
            sendError(res, 400, "Either gameId or email must be provided", ERROR_CODES.MISSING_FIELD);
        }

        if (!password) {
            sendError(res, 400, "Password must be provided", ERROR_CODES.MISSING_FIELD);
        }

        let user: any = await users.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { gameId }
                ]
            }
        });
        if (!user) {
            sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }

        let isPasswordValid = await verifyPassword(password, user.password);
        if (isPasswordValid.error) {
            sendError(res, 401, "Invalid password", ERROR_CODES.INVALID_PASSWORD);
        }

        let refreshToken = await generateToken(gameId, "refreshToken");
        let accessToken = await generateToken(gameId, "access");

        if (!refreshToken.success) {
            sendError(res, 500, `Error while generating refresh token: ${refreshToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
        }

        if (!accessToken.success) {
            sendError(res, 500, `Error while generating access token: ${accessToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);

        }

        user.refreshToken = refreshToken.token;
        await user.save();

        const cookieMaxAge = process.env.COOKIE_MAX_AGE ? parseInt(process.env.COOKIE_MAX_AGE) : 60 * 60 * 1000;
        res.cookie('accessToken', accessToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge,
            sameSite: 'strict'
        });

        let response = {
            gameId,
            firstName: user.firstName,
            lastName: user.lastName,
            accessToken
        }
        sendSuccess(res, 200, response);
    } catch (err) {
        sendError(res, 500, `Error while registering new user: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}