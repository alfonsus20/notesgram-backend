import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class TopupCoinDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(15000)
  amount: number;
}
