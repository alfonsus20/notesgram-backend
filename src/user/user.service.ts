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

  async getUserProfile(userId: number) {
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
      message: 'Success get user profile',
      data: user,
    };
  }

  async getUserFollowers(userId: number) {
    const followers = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    const structured = followers.followers.map((follower) => follower.follower);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success get user followers',
      data: structured,
    };
  }

  async getUserFollowings(userId: number) {
    const followings = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        followings: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    const structured = followings.followings.map(
      (following) => following.following,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Success get user followings',
      data: structured,
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

  async getUserNotes(userId: number) {
    try {
      const notes = await this.prisma.note.findMany({
        where: { post: { userId } },
        include: { post: true, note_pictures: true },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get user notes',
        data: notes,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMyBookmarkedPosts(userId: number) {
    try {
      const posts = await this.prisma.postBookmark.findMany({
        where: { bookmarkerId: userId },
        select: {
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar_url: true,
                },
              },
              note: {
                include: { note_pictures: true },
              },
            },
          },
        },
      });

      const postsStructured = posts.map((post) => post.post);

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get bookmarked posts',
        data: postsStructured,
      };
    } catch (error) {
      throw error;
    }
  }
}
