import {IsNotEmpty, IsString, Matches, MaxLength, MinLength} from "class-validator";
import {Optional} from "@nestjs/common";

export class StudentInitializationDto {

    agent_referral_code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    dob: string;

}
