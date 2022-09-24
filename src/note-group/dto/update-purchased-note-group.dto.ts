import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePurchasedNoteGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber({}, { each: true })
  note_ids: number[];
}
