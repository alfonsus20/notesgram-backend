import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UserService } from '../user/user.service';
import { CommentPostDto, CreatePostDto } from './dto';

@Injectable()
export class PostService {
  constructor(
    private storageService: StorageService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async getPosts(userId: number) {
    const posts = await this.prisma.post.findMany({
      where: { userId: { not: userId } },
      include: {
        note: { include: { note_pictures: true } },
        user: {
          select: { id: true, username: true, name: true, avatar_url: true },
        },
        likers: { select: { likerId: true } },
      },
    });

    const purchasedNoteIds = await this.getPurchasedNoteIds(userId);

    const followingUserIds = (
      await this.userService.getUserFollowings(userId)
    ).data.map((following) => following.id);

    const modifiedNotes = posts.map((post) => ({
      ...post,
      note: {
        ...post.note,
        is_purchased: purchasedNoteIds.includes(post.note.id),
      },
      user: {
        ...post.user,
        is_followed: followingUserIds.includes(post.user.id),
      },
      is_liked: post.likers.map((liker) => liker.likerId).includes(userId),
    }));

    return {
      statusCode: HttpStatus.OK,
      message: 'Sukses get all post',
      data: modifiedNotes,
    };
  }

  async getPurchasedNoteIds(userId: number) {
    const purchasedNoteIds = (
      await this.prisma.notePurchase.findMany({
        where: { userId },
        select: { noteId: true },
      })
    ).map((data) => data.noteId);
    return purchasedNoteIds;
  }

  async getFollowingUsersPosts(userId: number) {
    const followingUsers = await this.prisma.user.findMany({
      where: { followers: { some: { followerId: { equals: userId } } } },
      select: {
        id: true,
      },
    });

    const purchasedNoteIds = await this.getPurchasedNoteIds(userId);

    const followingUsersPosts = await this.prisma.post.findMany({
      where: { userId: { in: followingUsers.map((user) => user.id) } },
      select: {
        id: true,
        caption: true,
        createdAt: true,
        note: { include: { note_pictures: true } },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
          },
        },
        _count: { select: { likers: true, commenters: true } },
      },
    });

    const modifiedFollowingUsersPosts = followingUsersPosts.map((post) => ({
      ...post,
      note: {
        ...post.note,
        is_purchased: purchasedNoteIds.includes(post.note.id),
      },
    }));

    return {
      statusCode: HttpStatus.OK,
      message: "Success get following users' posts",
      data: modifiedFollowingUsersPosts,
    };
  }

  async createPost(
    userId: number,
    files: Array<Express.Multer.File>,
    dto: CreatePostDto,
  ) {
    if (
      files.some(
        (file) => !/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(file.originalname),
      )
    ) {
      throw new BadRequestException('Error file type : Only images allowed');
    }

    if (files.length < 2) {
      throw new BadRequestException('Minimum file amount is 2');
    }

    if (files.length >= 4 && files.length <= 10 && dto.price < 10000) {
      throw new BadRequestException('Minimum price is 10000');
    }

    if (files.length > 10 && dto.price < 15000) {
      throw new BadRequestException('Minimum price is 15000');
    }

    const post = await this.prisma.$transaction(async (prismaTransaction) => {
      const arrOfFileUploadPromise = files.map((file) =>
        this.storageService.upload(file),
      );

      const arrOfFileUrl = await Promise.all(arrOfFileUploadPromise);

      const newPost = await prismaTransaction.post.create({
        data: {
          caption: dto.caption,
          userId,
          note: {
            create: {
              price: +dto.price,
              title: dto.title,
              note_pictures: {
                create: arrOfFileUrl.map((file) => ({ picture_url: file })),
              },
            },
          },
        },
        include: { note: { include: { note_pictures: true } } },
      });

      return newPost;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Sukses upload post',
      data: post,
    };
  }

  async likePost(userId: number, postId: number) {
    try {
      const postToLike = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!postToLike) {
        throw new NotFoundException('Postingan tidak ditemukan');
      }

      const postlike = await this.prisma.postLike.findFirst({
        where: { likerId: userId, postId },
      });

      if (postlike) {
        await this.prisma.postLike.delete({ where: { id: postlike.id } });
        return {
          statusCode: HttpStatus.OK,
          message: 'Sukses dislike post',
          data: null,
        };
      }

      await this.prisma.postLike.create({ data: { likerId: userId, postId } });
      return {
        statusCode: HttpStatus.OK,
        message: 'Sukses like post',
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async commentPost(userId: number, postId: number, dto: CommentPostDto) {
    try {
      const postToComment = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!postToComment) {
        throw new NotFoundException('Postingan tidak ditemukan');
      }

      const comment = await this.prisma.postComment.create({
        data: { commenterId: userId, postId, comment: dto.comment },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Sukses mengirimkan komentar',
        data: comment,
      };
    } catch (error) {
      throw error;
    }
  }

  async explorePost(noteTitle = '', username = '', authorName = '') {
    try {
      const notes = await this.prisma.note.findMany({
        where: { title: { contains: noteTitle, mode: 'insensitive' } },
      });

      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: authorName, mode: 'insensitive' } },
            { username: { contains: username, mode: 'insensitive' } },
          ],
        },
        select: { id: true, username: true, name: true, avatar_url: true },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success explore post',
        data: { notes, users },
      };
    } catch (error) {
      throw error;
    }
  }
}
