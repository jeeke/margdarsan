import {
  IsAlphanumeric, IsNotEmpty, IsNumber,
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
  @IsNotEmpty()
  password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    { message: 'Password too weak' },
  )
  new_password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsString()
  @IsNotEmpty()
  school: string;

  @IsString()
  @IsNotEmpty()
  area: string;

}
