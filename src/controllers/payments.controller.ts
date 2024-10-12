import { ERROR_CODES } from "utils/handleErrorCode";
import { Request, Response } from "express"
import { sendSuccess, sendError } from "utils/handleResponse";
import { PaymentMethods } from "db/models";

export const getPaymentMethods = async (req: Request, res: Response) => {
    try {
        let resp = await PaymentMethods.findAndCountAll();
        return sendSuccess(res, 200, resp);
    } catch (err) {
        return sendError(res, 500, `Error while registering new user: ${err}`, ERROR_CODES.SERVER_ERROR);
    }
}