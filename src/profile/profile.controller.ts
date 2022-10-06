import {
  Controller,
  Get,
  UseGuards,
  Put,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { EditProfileDto } from './dto';
import { ProfileService } from './profile.service';

@UseGuards(JwtGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@GetUser('id') userId: number) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  editProfile(
    @GetUser('id') userId: number,
    @Body() dto: EditProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.editProfile(userId, dto, file);
  }
}
