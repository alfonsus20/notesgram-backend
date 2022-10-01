import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePromoDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNumber()
  @Min(5)
  @Max(70)
  discount: number;

  @IsDateString()
  endAt: string;
}
