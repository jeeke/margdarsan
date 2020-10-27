import {
    IsAlphanumeric, IsNotEmpty, IsNumber, IsNumberString,
    IsString, Matches,
    MaxLength,
    MinLength
} from "class-validator";

export class StudentInitializationDto {

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(
    /^[A-Za-z0-9_]+$/,
    { message: 'Username can have a-z A-Z _ only' },
  )
  username: string;

  @IsString()
  otp: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  age_group: string;

  @IsString()
  @IsNotEmpty()
  interests: string;

}
