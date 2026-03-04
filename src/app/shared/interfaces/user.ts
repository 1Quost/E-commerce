export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    dateOfBirth?: string;
    imageUrl?: string;
    role?: string; // "user" | "admin"
    createdAt?: string;
    updatedAt?: string;
}