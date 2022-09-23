import { Injectable, HttpStatus } from '@nestjs/common';
import { User } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseNoteDto } from './dto';

@Injectable()
export class NoteService {
  constructor(private prismaService: PrismaService) {}

  async purchaseNote(user: User, dto: PurchaseNoteDto) {
    try {
      const note = await this.prismaService.note.findUnique({
        where: { id: dto.note_id },
      });

      if (!note) {
        throw new NotFoundException('Note is not found');
      }

      const totalAfterAdminFee = note.price + 500;

      if (user.coins < totalAfterAdminFee) {
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

      const purchase = await this.prismaService.$transaction(
        async (prismaTrans) => {
          const finalPrice = totalAfterAdminFee - note.price * (discount / 100);

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

          return newPurchase;
        },
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success purchase note',
        data: purchase,
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

  async getNoteById(noteId: number) {
    try {
      const notes = await this.prismaService.note.findUnique({
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
              _count: {
                select: { likers: true, commenters: true },
              },
            },
          },
          note_pictures: true,
          _count: {
            select: {
              purchases: true,
            },
          },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get note by id',
        data: notes,
      };
    } catch (error) {
      throw error;
    }
  }
}
