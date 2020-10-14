import {
  IsAlphanumeric, IsNotEmpty, IsNumber, IsPositive,
  IsString, Matches,
  MaxLength,
  MinLength
} from "class-validator";

export class DepositDto {

  @IsPositive()
  @IsNumber()
  amount: number;

  remark: string;

  @IsString()
  @IsNotEmpty()
  txn_time: string;

  @IsString()
  @IsNotEmpty()
  txn_code: string;

}
