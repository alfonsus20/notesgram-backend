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

      if (user.coins < note.price) {
        throw new BadRequestException('Your balance is not sufficient');
      }

      const isAlreadyPurchased =
        await this.prismaService.notePurchases.findFirst({
          where: { userId: user.id, noteId: note.id },
        });

      if (isAlreadyPurchased) {
        throw new BadRequestException('Note has already been purchased');
      }

      const purchase = await this.prismaService.$transaction(
        async (prismaTrans) => {
          await prismaTrans.user.update({
            where: { id: user.id },
            data: { coins: user.coins - note.price },
          });

          const newPurchase = await prismaTrans.notePurchases.create({
            data: { userId: user.id, noteId: note.id },
            include: { note: true },
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
}
