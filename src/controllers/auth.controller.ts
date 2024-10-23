import { Request, Response } from "express"
import { v4 as uuid_v4 } from 'uuid';
import { Users } from "../db/models";
import { encryptPassword, verifyPassword } from "../utils/handlePassword";
import { sendError, sendSuccess } from "../utils/handleResponse";
import { generateToken } from "../utils/handleToken";
import { ERROR_CODES } from "../utils/handleErrorCode";
import { Op } from "sequelize";
import { AuthenticatedRequest } from "types/common";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const userRegister = async (req: Request, res: Response) => {
    try {
        const { img, firstName, lastName, email, password, loginType, phone, dob } = req.body;

        if (!loginType || loginType === "") {
            return sendError(res, 400, `Please provide loginType`, ERROR_CODES.MISSING_FIELD);
        }

        if (loginType === "email" && !email) {
            return sendError(res, 400, "Email address must be provided if loginType is email", ERROR_CODES.INVALID_VALUE);
        }
        if (email && !emailRegex.test(email)) {
            return sendError(res, 400, "Invalid email address format", ERROR_CODES.INVALID_EMAIL);
        }
        if (loginType === "password" && !password) {
            return sendError(res, 400, "Password must be provided if loginType is password", ERROR_CODES.INVALID_VALUE);
        }
        if (loginType === "phone" && !phone) {
            return sendError(res, 400, "Phone number must be provided if loginType is phone", ERROR_CODES.INVALID_VALUE);
        }

        const conditions = [];
        if (email) {
            conditions.push({ email });
        }
        if (phone) {
            conditions.push({ phone: phone.toString() });
        }

        let resp = await Users.findOne({
            where: {
                [Op.or]: conditions
            }
        });
        if (resp) {
            return sendError(res, 409, `Email address or phone number already registered`, ERROR_CODES.USER_ALREADY_EXISTS);
        }

        const userId = await uuid_v4();

        let refreshToken = await generateToken(userId, "refresh");
        if (!refreshToken.success) {
            return sendError(res, 500, `Error while generating refresh token: ${refreshToken.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
        }

        let createUser: any = {
            userId, loginType, refreshToken: refreshToken.token, balance: 0
        }

        if (email) {
            createUser.email = email;
        }
        if (img) {
            createUser.img = img;
        }
        if (firstName) {
            createUser.firstName = firstName;
        }
        if (lastName) {
            createUser.lastName = lastName;
        }
        if (phone) {
            createUser.phone = phone.toString();
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

        await Users.create(createUser);

        let accessToken = await generateToken(userId, "access");
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

        let response = { userId, email, firstName, lastName, phone, dob, balance: 0, accessToken: accessToken?.token }
        return sendSuccess(res, 200, response);
    } catch (err) {
        return sendError(res, 500, `Error while registering new user: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const userLogin = async (req: Request, res: Response) => {
    try {
        const { img, firstName, lastName, email, password, loginType, phone, dob } = req.body;
        if (!loginType || loginType === "") {
            return sendError(res, 400, "loginType must be provided", ERROR_CODES.MISSING_FIELD);
        }

        if (loginType === "email" && !email) {
            return sendError(res, 400, "Email address must be provided if loginType is email", ERROR_CODES.INVALID_VALUE);
        }
        if (email && !emailRegex.test(email)) {
            return sendError(res, 400, "Invalid email address format", ERROR_CODES.INVALID_EMAIL);
        }

        if (loginType === "password" && !password) {
            return sendError(res, 400, "Password must be provided if loginType is password", ERROR_CODES.INVALID_VALUE);
        }
        if (loginType === "phone" && !phone) {
            return sendError(res, 400, "Phone number must be provided if loginType is phone", ERROR_CODES.INVALID_VALUE);
        }

        const conditions = [];
        if (email) {
            conditions.push({ email });
        }
        if (phone) {
            conditions.push({ phone: phone.toString() });
        }

        let user: any = await Users.findOne({
            where: {
                [Op.or]: conditions
            }
        });

        if (!user) {
            const userId = await uuid_v4();

            let refreshToken2 = await generateToken(userId, "refreshToken");
            let accessToken2 = await generateToken(userId, "access");
    
            if (!refreshToken2.success) {
                return sendError(res, 500, `Error while generating refresh token: ${refreshToken2.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
            }
    
            if (!accessToken2.success) {
                return sendError(res, 500, `Error while generating access token: ${accessToken2.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
            }
            let createUser: any = {
                userId, loginType, refreshToken: refreshToken2.token, balance: 0
            }
    
            if (email) {
                createUser.email = email;
            }
            if (img) {
                createUser.img = img;
            }
            if (firstName) {
                createUser.firstName = firstName;
            }
            if (lastName) {
                createUser.lastName = lastName;
            }
            if (phone) {
                createUser.phone = phone.toString();
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
    
            await Users.create(createUser);

            if (!accessToken2.success) {
                return sendError(res, 500, `Error while generating access token: ${accessToken2.error}`, ERROR_CODES.TOKEN_GENERATION_FAILED);
            }
    
            const cookieMaxAge = process.env.COOKIE_MAX_AGE ? parseInt(process.env.COOKIE_MAX_AGE) : 60 * 60 * 1000;
            res.cookie('accessToken', accessToken2.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: cookieMaxAge,
                sameSite: 'strict'
            });
    
            let response = { img, userId, email, firstName, lastName, phone, dob, balance: 0, accessToken: accessToken2?.token }
            return sendSuccess(res, 200, response);
        }

        if (password) {
            let isPasswordValid = await verifyPassword(password, user.password);
            if (isPasswordValid.error) {
                return sendError(res, 401, "Invalid password", ERROR_CODES.INVALID_PASSWORD);
            }
        }

        
        let refreshToken = await generateToken(user.userId, "refreshToken");
        let accessToken = await generateToken(user.userId, "access");

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
            userId: user.userId,
            img: user.img,
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

export const userLogout = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req?.userId;
        if (!userId) {
            return sendError(res, 400, "userId must be provided", ERROR_CODES.MISSING_FIELD);
        }

        let user: any = await Users.findOne({
            where: {
                userId
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