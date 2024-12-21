import { Users } from "../db/models";
import { Socket } from "socket.io";
import { SocketError } from "../types/socketTypes";
import { ERROR_CODES } from "../utils/handleErrorCode";
import { verifyToken } from "../utils/handleToken";

export const validateSocket = async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.headers.authorization?.split(" ")[1];
    console.log(token ,'ppppppppppppppp')
    if (token) {
        let validateToken: any = await verifyToken(token, "access");

        if (!validateToken?.success) {
            const error: SocketError = new Error("Invalid token. Please log in again");
            error.data = { statusCode: 403, success: false, error: "Invalid token. Please log in again.", errorCode: ERROR_CODES.INVALID_TOKEN }
            next(error);

        } else {
            let resp = await Users.findOne({
                where: {
                    userId: validateToken?.decoded?.userId
                }
            });
            if (resp) {
                socket.data.user = resp;
                next();

            } else {
                const error: SocketError = new Error("User not found");
                error.data = { statusCode: 404, success: false, error: "User not found", errorCode: ERROR_CODES.USER_NOT_FOUND }
                next(error);
            }
        }
    } else {
        const error: SocketError = new Error("Authentication required. Please sign in");
        error.data = { statusCode: 401, success: false, error: "Authentication required. Please sign in.", errorCode: ERROR_CODES.ACCESS_TOKEN_MISSING }
        next(error);
    }
}