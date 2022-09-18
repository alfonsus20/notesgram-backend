import { IsNotEmpty, IsNumber } from 'class-validator';

export class PurchaseNoteDto {
  @IsNotEmpty()
  @IsNumber()
  note_id: number;
}
