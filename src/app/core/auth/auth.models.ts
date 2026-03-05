export type Role = 'user' | 'admin';

export interface ApiUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    dateOfBirth?: string;
    imageUrl?: string;
    role: Role;
    createdAt?: string;
    updatedAt?: string;
}

/** New ngrok backend format */
export interface LoginResponseV2 {
    token: string;
    user: ApiUser;
}

/** Old local backend format (Ali message) */
export interface LoginResponseV1 {
    Login: {
        AccessToken: string;
        ExpiresIn: number;
        RefreshExpiresIn: number;
        RefreshToken: string;
        TokenType: string; // "bearer"
        NotBeforePolicy?: number;
        SessionState?: string;
        Scope?: string;
    };
}

/** Shared: what our frontend wants internally */
export interface NormalizedAuth {
    accessToken: string;
    refreshToken?: string;
    user?: ApiUser;
}