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
    gameId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string | null;
    dob: string | null;
    refreshToken: string | null;
}
