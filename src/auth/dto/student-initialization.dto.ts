import {IsDate, IsNotEmpty, IsNumber, IsNumberString, IsString} from "class-validator";

export class StudentInitializationDto {

    agent_referral_code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumberString()
    @IsNotEmpty()
    dob: string;

    @IsString()
    @IsNotEmpty()
    category: string;

}
