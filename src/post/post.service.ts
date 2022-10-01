import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
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
    private notificationService: NotificationService,
  ) {}

  async getPosts(userId: number) {
    const posts = await this.prisma.post.findMany({
      include: {
        note: { include: { note_pictures: true } },
        user: {
          select: { id: true, username: true, name: true, avatar_url: true },
        },
        bookmarks: { select: { bookmarkerId: true } },
        likes: { select: { likerId: true } },
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
      is_liked: post.likes.map((liker) => liker.likerId).includes(userId),
      is_bookmarked: post.bookmarks
        .map((bookmark) => bookmark.bookmarkerId)
        .includes(userId),
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
        likes: true,
        bookmarks: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    const modifiedFollowingUsersPosts = followingUsersPosts.map((post) => ({
      ...post,
      note: {
        ...post.note,
        is_purchased: purchasedNoteIds.includes(post.note.id),
      },
      is_liked: post.likes.map((liker) => liker.likerId).includes(userId),
      is_bookmarked: post.bookmarks
        .map((bookmark) => bookmark.bookmarkerId)
        .includes(userId),
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
        include: { user: true },
      });

      if (!postToLike) {
        throw new NotFoundException('Postingan tidak ditemukan');
      }

      const postlike = await this.prisma.postLike.findFirst({
        where: { likerId: userId, postId },
        include: { liker: true },
      });

      if (postlike) {
        await this.prisma.postLike.delete({ where: { id: postlike.id } });
        return {
          statusCode: HttpStatus.OK,
          message: 'Sukses dislike post',
          data: null,
        };
      }

      const newPostlike = await this.prisma.postLike.create({
        data: { likerId: userId, postId },
        include: { liker: true },
      });

      await this.notificationService.sendNotifToSpecificUser(
        postToLike.userId,
        {
          title: 'Notesgram',
          body: `${newPostlike.liker.username} menyukai postingan Anda`,
        },
        'LIKE',
        { postId, creatorId: newPostlike.likerId },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Success like post',
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
        include: { user: true },
      });

      if (!postToComment) {
        throw new NotFoundException('Postingan tidak ditemukan');
      }

      const comment = await this.prisma.postComment.create({
        data: { commenterId: userId, postId, comment: dto.comment },
        include: { commenter: true },
      });

      await this.notificationService.sendNotifToSpecificUser(
        postToComment.userId,
        {
          title: 'Notesgram',
          body: `${comment.commenter.username} mengomentari postingan Anda`,
        },
        'COMMENT',
        { postId, creatorId: comment.commenter.id },
      );

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

  async bookmarkPost(userId: number, postId: number) {
    try {
      const postToBookmark = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!postToBookmark) {
        throw new NotFoundException('Post not found');
      }

      const postBookmark = await this.prisma.postBookmark.findFirst({
        where: { bookmarkerId: userId, postId },
      });

      if (postBookmark) {
        await this.prisma.postBookmark.delete({
          where: { id: postBookmark.id },
        });
        return {
          statusCode: HttpStatus.OK,
          message: 'Success unbookmark post',
          data: null,
        };
      }

      await this.prisma.postBookmark.create({
        data: { bookmarkerId: userId, postId },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success bookmark post',
        data: null,
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
