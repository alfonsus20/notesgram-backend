import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePurchasedNoteGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
