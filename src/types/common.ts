import { Request } from "express";

// export interface RefreshTokenAttributes {
//     token?: string,
//     error?: unknown,
//     success: boolean,
// }

// export interface EncryptedPasswordAttributes {
//     success: boolean,
//     password?: string,
//     error?: unknown
// }

export interface UserAttributes {
    id?: number;
    userId: string;
    img: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    loginType: string;
    phone: string | null;
    dob: string | null;
    refreshToken: string | null;
    balance: number;
}

export interface AuthenticatedRequest extends Request {
    userId?: any;
}