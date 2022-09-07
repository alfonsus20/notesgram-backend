import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  caption: string;

  @IsNumberString()
  @IsNotEmpty()
  price: number;
}
