import {
  IsAlphanumeric,
  IsString, Matches,
  MaxLength,
  MinLength
} from "class-validator";

export class AgentSignupDto {

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(
    /^[A-Za-z0-9_]+$/,
    { message: 'Username can have a-z A-Z _ only' },
  )
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(
    /^[A-Za-z0-9_]+$/,
    { message: 'Invalid Referral Code' },
  )
  agentCode: string;

  @IsString()
  name: string;

}
