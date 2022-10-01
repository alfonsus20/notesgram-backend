import { Injectable, HttpStatus } from '@nestjs/common';
import { User } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseNoteDto } from './dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class NoteService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async purchaseNote(user: User, dto: PurchaseNoteDto) {
    try {
      const note = await this.prismaService.note.findUnique({
        where: { id: dto.note_id },
      });

      if (!note) {
        throw new NotFoundException('Note is not found');
      }

      if (user.coins < note.price) {
        throw new BadRequestException('Your balance is not sufficient');
      }

      const isAlreadyPurchased =
        await this.prismaService.notePurchase.findFirst({
          where: { userId: user.id, noteId: note.id },
        });

      if (isAlreadyPurchased) {
        throw new BadRequestException('Note has already been purchased');
      }

      let discount = 0;

      if (dto.promo_code) {
        const promo = await this.prismaService.promoCode.findUnique({
          where: { code: dto.promo_code },
        });

        if (!promo) {
          throw new NotFoundException('Promo code not found');
        }

        if (new Date() > new Date(promo.endAt)) {
          throw new BadRequestException('Promo code has expired');
        }

        discount = promo.discount;
      }

      const { newPurchase, currentUserInfo } =
        await this.prismaService.$transaction(async (prismaTrans) => {
          const finalPrice = note.price * ((100 - discount) / 100);

          await prismaTrans.user.update({
            where: { id: user.id },
            data: { coins: user.coins - finalPrice },
          });

          const newPurchase = await prismaTrans.notePurchase.create({
            data: { userId: user.id, noteId: note.id, price: finalPrice },
            include: {
              note: {
                include: {
                  post: {
                    include: {
                      user: {
                        select: {
                          username: true,
                          avatar_url: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          const currentUserInfo = await prismaTrans.user.findUnique({
            where: { id: user.id },
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
              coins: true,
            },
          });

          await this.notificationService.sendNotifToSpecificUser(
            newPurchase.note.post.userId,
            {
              title: 'Notesgram',
              body: `${currentUserInfo.username} baru saja membeli catatan Anda`,
            },
            'INFO',
            { noteId: newPurchase.noteId, creatorId: currentUserInfo.id },
          );

          return { newPurchase, currentUserInfo };
        });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success purchase note',
        data: { ...newPurchase, user: currentUserInfo },
      };
    } catch (error) {
      throw error;
    }
  }

  async getMyPurchasedNotes(userId: number) {
    try {
      const purchasedNoteIds = await this.prismaService.notePurchase.findMany({
        where: { userId },
        select: { noteId: true },
      });

      const purchasedNotes = await this.prismaService.note.findMany({
        where: { id: { in: purchasedNoteIds.map((data) => data.noteId) } },
        include: {
          note_pictures: true,
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar_url: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get my purchased notes',
        data: purchasedNotes,
      };
    } catch (error) {
      throw error;
    }
  }

  async getNoteById(userId: number, noteId: number) {
    try {
      const note = await this.prismaService.note.findUnique({
        where: { id: noteId },
        include: {
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar_url: true,
                  name: true,
                },
              },
              comments: {
                select: {
                  id: true,
                  comment: true,
                  commenter: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      avatar_url: true,
                    },
                  },
                },
              },
              _count: {
                select: { likes: true, comments: true },
              },
              likes: true,
              bookmarks: true,
            },
          },
          note_pictures: true,
          _count: {
            select: {
              purchases: true,
            },
          },
          purchases: { select: { userId: true } },
        },
      });

      note.post['is_liked'] = note.post.likes
        .map((liker) => liker.likerId)
        .includes(userId);

      note.post['is_bookmarked'] = note.post.bookmarks
        .map((bookmarker) => bookmarker.bookmarkerId)
        .includes(userId);

      note['is_purchased'] = note.purchases
        .map((purchase) => purchase.userId)
        .includes(userId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get note by id',
        data: note,
      };
    } catch (error) {
      throw error;
    }
  }
}
