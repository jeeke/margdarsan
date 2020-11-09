export interface JwtPayload {
    phone: string;
    user_type: string;
    initialized: boolean;
}

export const UserType = {
    Agent: "agent",
    Student: "student",
    Admin: "admin"
}