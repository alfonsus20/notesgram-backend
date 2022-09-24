import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookmarkedNoteGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
