import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsernameDto } from './dto';

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

  async createUsername(userId: number, dto: CreateUsernameDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (existingUser) {
        throw new BadRequestException('Username is already taken');
      }

      const user = await this.prisma.user.update({
        data: { username: dto.username },
        where: { id: userId },
      });

      return { message: 'Username created', data: { username: user.username } };
    } catch (err) {
      throw err;
    }
  }

  async followUser(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestException(
        'Anda tidak bisa menfollow diri anda sendiri',
      );
    }

    try {
      const userToFollow = await this.prisma.user.findUnique({
        where: { id: followingId },
      });

      if (!userToFollow) {
        throw new BadRequestException(
          'User yang ingin difollow tidak ditemukan',
        );
      }

      const follow = await this.prisma.follows.findFirst({
        where: { followerId, followingId },
      });

      if (follow) {
        await this.prisma.follows.delete({ where: { id: follow.id } });
        return { message: 'Berhasil unfollow', data: null };
      }

      await this.prisma.follows.create({ data: { followerId, followingId } });
      return { message: 'Berhasil follow', data: null };
    } catch (err) {
      throw err;
    }
  }
}
