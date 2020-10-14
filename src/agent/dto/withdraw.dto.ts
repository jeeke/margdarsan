import {
  IsAlphanumeric, IsNotEmpty, IsNumber, IsPositive,
  IsString, Matches,
  MaxLength,
  MinLength
} from "class-validator";

export class WithdrawDto {

  @IsPositive()
  @IsNumber()
  amount: number;

  @IsString()
  remark: string;

}
