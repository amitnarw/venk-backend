import { Response } from "express"

export const sendSuccess = (res: Response, statusCode: number, data?: any, message?: string) => {
    let responsePayload: any = {
        success: true
    }

    if (message) {
        responsePayload.message = message;
    }

    if (data) {
        responsePayload.data = data;
    }
    res.status(statusCode).json(responsePayload);
}

export const sendError = (res: Response, statusCode: number, error: any, errorCode: string) => {
    res.status(statusCode).json({
        success: false,
        error,
        errorCode
    });
}