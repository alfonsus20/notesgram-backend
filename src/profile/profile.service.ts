import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EditProfileDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(
    private prismaService: PrismaService,
    private storageService: StorageService,
  ) {}

  async getProfile(userId: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get my profile',
        data: user,
      };
    } catch (error) {
      throw error;
    }
  }

  async editProfile(
    userId: number,
    dto: EditProfileDto,
    profilePic: Express.Multer.File,
  ) {
    try {
      if (dto.username) {
        const user = await this.prismaService.user.findFirst({
          where: { username: dto.username, id: { not: userId } },
        });

        if (user) {
          throw new BadRequestException('Username is already taken');
        }
      }

      const newData = {
        name: dto.name,
        username: dto.username,
        fcm_token: dto.fcm_token,
      };

      if (profilePic) {
        if (
          !/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(profilePic.originalname)
        ) {
          throw new BadRequestException('Only image allowed');
        }

        const newProfilePicUrl = await this.storageService.upload(profilePic);
        newData['avatar_url'] = newProfilePicUrl;
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: newData,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success update profile',
        data: updatedUser,
      };
    } catch (error) {
      throw error;
    }
  }
}
