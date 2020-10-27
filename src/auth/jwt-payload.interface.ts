export interface JwtPayload {
    username: string;
    phone: string;
    user_type: string;
    initialized: boolean;
}

export const UserType = {
    Agent: "agent",
    Student: "student"
}