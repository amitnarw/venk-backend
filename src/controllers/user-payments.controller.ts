import { ERROR_CODES } from "../utils/handleErrorCode";
import { Request, Response } from "express"
import { sendSuccess, sendError } from "../utils/handleResponse";
import { UserPaymentMethods, Users } from "../db/models";

export const getUserPaymentMethods = async (req: Request, res: Response) => {
    try {
        let { userId } = req.params;

        if (!userId) {
            return sendError(res, 400, 'Please send userId', ERROR_CODES.MISSING_FIELD);
        }

        let resp = await Users.findOne({
            where: {
                userId
            },
        });

        if (!resp) {
            return sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }
        let resp2 = await UserPaymentMethods.findAndCountAll();
        return sendSuccess(res, 200, resp2);
    } catch (err) {
        return sendError(res, 500, `Error while getting all user payment methods: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const createUserPaymentMethod = async (req: Request, res: Response) => {
    try {
        let { userId, method, details } = req.body;
        if (!userId || !method || !details) {
            return sendError(res, 400, 'Please send userId, method and details.', ERROR_CODES.MISSING_FIELD);
        }

        let resp = await Users.findOne({
            where: {
                userId
            },
            attributes: ["userId", "firstName", "lastName", "email", "phone", "dob", 'balance']
        });

        if (!resp) {
            return sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }

        let resp2 = await UserPaymentMethods.findOne({
            where: {
                userId,
                method,
                details
            }
        });
        if (resp2) {
            return sendError(res, 409, "This user already has this method and the associated details added.", ERROR_CODES.ALREADY_PRESENT);
        }

        await UserPaymentMethods.create({
            userId,
            method,
            details
        });

        return sendSuccess(res, 200, "Payment method added successfully");
    } catch (err) {
        return sendError(res, 500, `Error while creating new user payment method: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}