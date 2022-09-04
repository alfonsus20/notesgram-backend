import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUsernameDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
