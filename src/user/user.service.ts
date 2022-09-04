import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getMyProfile(user: User) {
    delete user.password;
    return { message: 'Success get my profile', data: { ...user } };
  }

  async checkUsername(username: string) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { username } });

      if (user) {
        throw new BadRequestException('Username is already taken');
      }

      return { message: 'Username is available', data: { is_available: true } };
    } catch (err) {
      throw err;
    }
  }
}
