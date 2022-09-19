import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class PurchaseNoteDto {
  @IsNotEmpty()
  @IsNumber()
  note_id: number;

  @IsOptional()
  @IsString()
  promo_code: string;
}
