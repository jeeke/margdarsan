import {IsString, Matches, MaxLength, MinLength} from "class-validator";
import {Optional} from "@nestjs/common";

export class AgentSignupDto {

    @IsString()
    @MinLength(6, {
            message: 'Referral Code must be minimum of 6 characters'
        })
    @MaxLength(20, {
        message: 'Referral Code can be maximum of 20 characters'
    })
    @Matches(
        /^[A-Za-z0-9]+$/,
        {message: 'Referral Code can have letters and numbers only'},
    )
    my_referral_code: string;

    @IsString()
    name: string;

    address: string;

    agent_referral_code: string;

}
