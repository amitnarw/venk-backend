import sequelize from "db/dbConnect";
import { Users, UserTransactions } from "db/models";
import { Request, Response } from "express";
import { ERROR_CODES } from "utils/handleErrorCode";
import { sendSuccess, sendError } from "utils/handleResponse";

const checkUserInDB = async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
        return sendError(res, 400, "Please provide userId", ERROR_CODES.MISSING_FIELD);
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

    return { result: true, details: resp };
}

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        let checkUser: any = await checkUserInDB(req, res);
        if (checkUser?.result) {
            return sendSuccess(res, 200, checkUser?.details);
        } else {
            return sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }

    } catch (err) {
        return sendError(res, 500, `Error while getting user information: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const getUserTransactions = async (req: Request, res: Response) => {
    try {
        let checkUser: any = await checkUserInDB(req, res);
        if (checkUser?.result) {
            let resp2 = await UserTransactions.findAndCountAll({
                where: {
                    userId: checkUser?.details?.userId
                }
            });
    
            return sendSuccess(res, 200, resp2);
        } else {
            return sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }
    } catch (err) {
        return sendError(res, 500, `Error while getting user transactions: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}

export const createUserTransaction = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();

    try {
        let checkUser: any = await checkUserInDB(req, res);
        const { userId, transactionId, type, method, details, amount, status, effect } = req.body;

        const validStatuses = ['pending', 'completed', 'failed'];
        const validEffects = ['add', 'subtract'];
        if (!validStatuses.includes(status)) {
            return sendError(res, 400, 'Invalid status value. Allowed values are: pending, completed, failed.', ERROR_CODES.INVALID_VALUE);
        }
        if (!validEffects.includes(effect)) {
            return sendError(res, 400, 'Invalid effect value. Allowed values are: add, subtract.', ERROR_CODES.INVALID_VALUE);
        }

        if (checkUser?.result) {
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
                let newBalance: number = checkUser?.details?.balance;

                if (effect === "add") {
                    newBalance += amount;
                } else if (effect === "subtract") {
                    newBalance -= amount;
                }

                await Users.update(
                    { balance: newBalance },
                    { where: { userId }, transaction }
                );

                await transaction.commit();
            }

            return sendSuccess(res, 200, "Transaction added");
        } else {
            return sendError(res, 404, "User not found", ERROR_CODES.USER_NOT_FOUND);
        }
    } catch (err) {
        await transaction.rollback();
        return sendError(res, 500, `Error while adding user transaction: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
};
