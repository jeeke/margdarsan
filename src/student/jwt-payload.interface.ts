export interface JwtPayload {
  username: string;
  phone: string;
  user_type: UserType
}

export enum UserType {
  Agent,
  Student,
}