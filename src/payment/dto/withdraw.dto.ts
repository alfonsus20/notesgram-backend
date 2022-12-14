import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(15000)
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  account_number: number;

  @IsNotEmpty()
  @IsString()
  bank_code: string;
}
