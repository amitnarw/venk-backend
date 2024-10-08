import { Request, Response } from "express"
import { v4 as uuid_v4 } from 'uuid';
import { users } from "../db/models";
import { encryptPassword, verifyPassword } from "../utils/handlePassword";
import { sendError, sendSuccess } from "../utils/handleResponse";
import { generateToken } from "../utils/handleToken";
import { ERROR_CODES } from "../utils/handleErrorCode";
import { Op } from "sequelize";
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env' });

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const userRegister = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password, loginType, phone, dob } = req.body;
        const requiredFields = ['firstName', 'email', "loginType"];
        for (const field of requiredFields) {
            if (!req.body[field] || req.body[field] === "") {
                return sendError(res, 400, `Missing required field: ${field}`, ERROR_CODES.MISSING_FIELD);
            }
        }

        const conditions = [];
        if (email) {
            conditions.push({ email });
        }
        if (phone) {
            conditions.push({ phone });
        }

        let resp = await users.findOne({
            where: {
                [Op.or]: conditions
            }
        });
        if (resp) {
            return sendError(res, 400, `Email address or phone number already registered`, ERROR_CODES.USER_ALREADY_EXISTS);
        }

        const gameId = uuid_v4();

        let refreshToken = await generateToken(gameId, "refresh");
        if (!refreshToken.success) {
            return sendError(res, 500, `Error while generating refresh token: ${refreshToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
        }

        let createUser: any = {
            gameId, firstName, email, loginType, refreshToken: refreshToken.token, balance: 0
        }

        if (lastName) {
            createUser.lastName = lastName;
        }
        if (phone) {
            createUser.phone = phone;
        }
        if (dob) {
            createUser.dob = dob;
        }

        if (password) {
            let securedPassword = await encryptPassword(password);
            if (!securedPassword.success) {
                return sendError(res, 500, `Error while encrypting password: ${securedPassword.error}`, ERROR_CODES.PASSWORD_ENCRYPTION_FAILED);
            }
            createUser.password = securedPassword
        }

        await users.create(createUser);

        let accessToken = await generateToken(gameId, "access");
        if (!accessToken.success) {
            return sendError(res, 500, `Error while generating access token: ${accessToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
        }

        const cookieMaxAge = process.env.COOKIE_MAX_AGE ? parseInt(process.env.COOKIE_MAX_AGE) : 60 * 60 * 1000;
        res.cookie('accessToken', accessToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge,
            sameSite: 'strict'
        });

        let response = { gameId, email, firstName, lastName, phone, dob, balance: 0, accessToken: accessToken?.token }
        return sendSuccess(res, 200, response);
    } catch (err) {
        return sendError(res, 500, `Error while registering new user: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const userLogin = async (req: Request, res: Response) => {
    try {
        const { email, password, loginType } = req.body;
        if (!email || !loginType || email === "" || loginType === "") {
            return sendError(res, 400, "Email and login type must be provided", ERROR_CODES.MISSING_FIELD);
        }

        if (!emailRegex.test(email)) {
            return sendError(res, 400, "Invalid email address format", ERROR_CODES.INVALID_EMAIL);
        }

        let user: any = await users.findOne({
            where: {
                email,
                loginType
            }
        });
        if (!user) {
            return sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }

        if (password) {
            let isPasswordValid = await verifyPassword(password, user.password);
            if (isPasswordValid.error) {
                return sendError(res, 401, "Invalid password", ERROR_CODES.INVALID_PASSWORD);
            }
        }

        let refreshToken = await generateToken(user.gameId, "refreshToken");
        let accessToken = await generateToken(user.gameId, "access");

        if (!refreshToken.success) {
            return sendError(res, 500, `Error while generating refresh token: ${refreshToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
        }

        if (!accessToken.success) {
            return sendError(res, 500, `Error while generating access token: ${accessToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);

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
            gameId: user.gameId,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            dob: user.dob,
            balance: user.balance,
            accessToken: accessToken?.token,
        }
        return sendSuccess(res, 200, response);
    } catch (err) {
        return sendError(res, 500, `Error while registering new user: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const userLogout = async (req: Request, res: Response) => {
    try {
        const { email, gameId } = req.body;
        if (!email && !gameId) {
            return sendError(res, 400, "Either email or gameId must be provided", ERROR_CODES.MISSING_FIELD);
        }

        const conditions = [];
        if (email) {
            conditions.push({ email });
        }
        if (gameId) {
            conditions.push({ gameId });
        }
        let user: any = await users.findOne({
            where: {
                [Op.or]: conditions
            }
        });
        if (!user) {
            return sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }
        await user.update({ refreshToken: null });
        res.clearCookie('accessToken');
        return sendSuccess(res, 200, "User logged out successfully");
    } catch (err) {
        return sendError(res, 500, `Error while logout: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}