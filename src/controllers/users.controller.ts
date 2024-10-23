import sequelize from "../db/dbConnect";
import { Users, UserTransactions } from "../db/models";
import { Request, Response } from "express";
import { ERROR_CODES } from "../utils/handleErrorCode";
import { sendSuccess, sendError } from "../utils/handleResponse";


export const getUserDetails = async (req: Request, res: Response) => {
    try {
        let { userId } = req.params;

        if (!userId) {
            return sendError(res, 400, 'Please send userId', ERROR_CODES.MISSING_FIELD);
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
        return sendSuccess(res, 200, resp);

    } catch (err) {
        return sendError(res, 500, `Error while getting user information: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const getUserTransactions = async (req: Request, res: Response) => {
    try {
        let { userId } = req.params;
        if (!userId) {
            return sendError(res, 400, 'Please send userId', ERROR_CODES.MISSING_FIELD);
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

        let resp2 = await UserTransactions.findAndCountAll({
            where: {
                userId
            }
        });

        return sendSuccess(res, 200, resp2);

    } catch (err) {
        return sendError(res, 500, `Error while getting user transactions: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const createUserTransaction = async (req: Request, res: Response) => {

    try {
        const { userId, transactionId, type, method, details, amount, status, effect } = req.body;
        if (!transactionId || !userId || !type || !method || !amount) {
            return sendError(res, 400, 'Please send transactionId, userId, type, method and amount', ERROR_CODES.MISSING_FIELD);
        }
    
        let checkUser: any = await Users.findOne({
            where: {
                userId
            },
            attributes: ["userId", "firstName", "lastName", "email", "phone", "dob", 'balance']
        });
        if (!checkUser) {
            return sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }

        const validStatuses = ['pending', 'completed', 'failed'];
        const validEffects = ['add', 'subtract'];
        if (!validStatuses.includes(status)) {
            return sendError(res, 400, 'Invalid status value. Allowed values are: pending, completed, failed.', ERROR_CODES.INVALID_VALUE);
        }
        if (!validEffects.includes(effect)) {
            return sendError(res, 400, 'Invalid effect value. Allowed values are: add, subtract.', ERROR_CODES.INVALID_VALUE);
        }

        const transaction = await sequelize.transaction();

        let resp = await UserTransactions.create({
            transactionId,
            userId,
            type,
            method,
            details,
            amount,
            status,
            effect
        }, { transaction });

        if (resp) {
            let newBalance: number = checkUser?.balance;

            if (effect === "add") {
                newBalance += amount;
            } else if (effect === "subtract") {
                if (newBalance - amount < 0) {
                    await transaction.rollback();
                    return sendError(res, 400, "Insufficient balance", ERROR_CODES.INVALID_VALUE);
                }
                newBalance -= amount;
            }

            await Users.update(
                { balance: newBalance },
                { where: { userId }, transaction }
            );

            await transaction.commit();
        }

        return sendSuccess(res, 200, "Transaction added");

    } catch (err) {
        return sendError(res, 500, `Error while adding user transaction: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
};
