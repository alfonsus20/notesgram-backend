import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsernameDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { posts: true, followers: true, followings: true },
        },
      },
    });

    delete user.password;

    return {
      statusCode: HttpStatus.OK,
      message: 'Success get my profile',
      data: user,
    };
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

      return {
        statusCode: HttpStatus.OK,
        message: 'Username is available',
        data: { is_available: true },
      };
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

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Username created',
        data: { username: user.username },
      };
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
        throw new NotFoundException('User yang ingin difollow tidak ditemukan');
      }

      const follow = await this.prisma.follow.findFirst({
        where: { followerId, followingId },
      });

      if (follow) {
        await this.prisma.follow.delete({ where: { id: follow.id } });
        return {
          statusCode: HttpStatus.OK,
          message: 'Berhasil unfollow',
          data: null,
        };
      }

      await this.prisma.follow.create({ data: { followerId, followingId } });
      return {
        statusCode: HttpStatus.OK,
        message: 'Berhasil follow',
        data: null,
      };
    } catch (err) {
      throw err;
    }
  }
}
