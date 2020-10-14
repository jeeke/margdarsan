export interface JwtPayload {
    username: string;
    phone: string;
    user_type: UserType;
}
export declare enum UserType {
    Agent = 0,
    Student = 1
}
