import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTransactionHistory(userId: number) {
    const notePurchasedTransactions = (
      await this.prismaService.notePurchase.findMany({
        where: { userId },
        include: {
          note: {
            include: { post: { include: { user: true } }, note_pictures: true },
          },
        },
      })
    ).map((transaction) => ({ info: transaction, category: 'NOTE_PURCHASED' }));

    const noteSoldTransaction = (
      await this.prismaService.notePurchase.findMany({
        where: { note: { post: { userId } } },
        include: {
          note: {
            include: { post: { include: { user: true } }, note_pictures: true },
          },
        },
      })
    ).map((transaction) => ({ info: transaction, category: 'NOTE_SOLD' }));

    const topUpTransaction = (
      await this.prismaService.topupTransaction.findMany({ where: { userId } })
    ).map((transaction) => ({ info: transaction, category: 'TOPUP' }));

    const withDrawalTransaction = (
      await this.prismaService.withdrawalTransaction.findMany({
        where: { userId },
      })
    ).map((transaction) => ({ info: transaction, category: 'WITHDRAWAL' }));

    const modified = [
      ...notePurchasedTransactions,
      ...noteSoldTransaction,
      ...topUpTransaction,
      ...withDrawalTransaction,
    ].sort(
      (a, b) =>
        new Date(b.info.createdAt).getTime() -
        new Date(a.info.createdAt).getTime(),
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Success get transaction history',
      data: modified,
    };
  }
}
