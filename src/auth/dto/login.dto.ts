import {IsIn, IsString,} from "class-validator";
import {UserType} from "../jwt-payload.interface";

export class LoginDto {

    @IsIn([UserType.Student, UserType.Agent])
    user_type: string;

    @IsString()
    token: string;

}