import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/handleToken";
import { ERROR_CODES } from "../utils/handleErrorCode";
import { sendError } from "../utils/handleResponse";
import { AuthenticatedRequest } from "types/common";

const accessControl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.header("authorization")?.replace("Bearer ", "");
  if (!authToken) {
    return sendError(res, 401, "Authentication required. Please sign in.", ERROR_CODES.ACCESS_TOKEN_MISSING);
  }
  const { success, error, decoded }: any = await verifyToken(authToken, "access");
  if (!success) {
    switch (error.name) {
      case "JsonWebTokenError":
        return sendError(res, 403, "Invalid token. Please log in again.", ERROR_CODES.INVALID_TOKEN);
      case "TokenExpiredError":
        return sendError(res, 403, "Session expired. Please log in to continue.", ERROR_CODES.TOKEN_EXPIRED);
      default:
        return sendError(res, 403, "Invalid token. Please log in again.", ERROR_CODES.INVALID_TOKEN);
    }
  }
  req.userId = decoded?.userId;
  next();
};

export default accessControl;