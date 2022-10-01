import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentCallbackDto, WithdrawCallbackDto, WithdrawDto } from './dto';
import { TopupCoinDto } from './dto/topup-coin.dto';
import { PaymentStatus, WithdrawalStatus } from './enum';

@Injectable()
export class PaymentService {
  private oyBaseURL: string;
  private headers: { 'X-Api-Key': string; 'X-Oy-Username': string };

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    this.oyBaseURL = this.config.get<string>('OY_BASE_URL');
    this.headers = {
      'X-Api-Key': this.config.get<string>('OY_API_KEY'),
      'X-Oy-Username': this.config.get<string>('OY_USERNAME'),
    };
  }

  async handleCallbackTopupCoin(dto: PaymentCallbackDto) {
    let status = '';

    if (dto.status === 'complete') {
      status = PaymentStatus.SUCCESS;

      await this.prismaService.$transaction(async (prismaTrans) => {
        const { user, amount } = await prismaTrans.topupTransaction.findUnique({
          where: { id: dto.partner_tx_id },
          select: { amount: true, user: true },
        });

        await prismaTrans.user.update({
          where: { id: user.id },
          data: { coins: user.coins + amount },
        });
      });
    } else if (dto.status === 'waiting_payment') {
      status = PaymentStatus.WAITING;
    } else {
      status = PaymentStatus.FAILED;
    }

    const transaction = await this.prismaService.topupTransaction.update({
      where: { id: dto.partner_tx_id },
      data: { status, payment_method: dto.payment_method },
    });

    await this.notificationService.sendNotifToSpecificUser(
      transaction.userId,
      {
        title: 'Notesgram',
        body: `Topup coin sebesar ${transaction.amount} ${
          transaction.status === PaymentStatus.SUCCESS
            ? 'telah berhasil'
            : transaction.status === PaymentStatus.WAITING
            ? 'berstatus pending'
            : 'gagal'
        }`,
      },
      'TOPUP',
      { creatorId: transaction.userId, topupId: transaction.id },
    );
  }

  async topupCoin(user: User, dto: TopupCoinDto) {
    const { data, transaction } = await this.prismaService.$transaction(
      async (prismaTrans) => {
        const transaction = await prismaTrans.topupTransaction.create({
          data: {
            amount: dto.amount,
            userId: user.id,
            status: PaymentStatus.WAITING,
            admin_fee: 500,
          },
        });

        const fixedAmount = dto.amount + 500;

        const { data } = await this.httpService.axiosRef.post(
          `${this.oyBaseURL}/payment-checkout/create-v2`,
          {
            sender_name: user.name,
            amount: fixedAmount,
            email: user.email,
            is_open: false,
            include_admin_fee: true,
            list_disabled_payment_methods: 'CREDIT_CARD',
            va_display_name: 'Notesgram Coin Topup',
            partner_tx_id: transaction.id,
          },
          { headers: this.headers },
        );

        return { data, transaction };
      },
    );

    return {
      message: 'Success create topup coin transaction',
      statusCode: HttpStatus.OK,
      data: { payment: data, ...transaction },
    };
  }

  async withDrawMoney(user: User, dto: WithdrawDto) {
    try {
      if (user.coins < dto.amount + 500) {
        throw new BadRequestException('Balance is not sufficient');
      }

      const { data, transaction } = await this.prismaService.$transaction(
        async (prismaTrans) => {
          const transaction = await prismaTrans.withdrawalTransaction.create({
            data: {
              amount: dto.amount,
              userId: user.id,
              status: WithdrawalStatus.PROCESSING,
              account_number: dto.account_number,
              bank_code: dto.bank_code,
              admin_fee: 500,
            },
          });

          await prismaTrans.user.update({
            where: { id: user.id },
            data: { coins: user.coins - dto.amount },
          });

          // Minus admin fee
          const fixedAmount = dto.amount - 500;

          const { data } = await this.httpService.axiosRef.post(
            `${this.oyBaseURL}/remit`,
            {
              sender_name: user.name,
              amount: fixedAmount,
              email: user.email,
              partner_trx_id: transaction.id,
              recipient_bank: dto.bank_code,
              recipient_account: dto.account_number,
            },
            { headers: this.headers },
          );

          return { data, transaction };
        },
      );

      return {
        message: 'Success create withdrawal transaction',
        statusCode: HttpStatus.OK,
        data: { withdrawal: data, ...transaction },
      };
    } catch (error) {
      throw error;
    }
  }

  async handleCallbackWithdrawal(dto: WithdrawCallbackDto) {
    let status = '';

    if (dto.status.code === '000') {
      status = WithdrawalStatus.SUCCESS;
    } else {
      status = WithdrawalStatus.FAILED;
    }

    const transaction = await this.prismaService.withdrawalTransaction.update({
      where: { id: dto.partner_trx_id },
      data: {
        status,
      },
    });

    await this.notificationService.sendNotifToSpecificUser(
      transaction.userId,
      {
        title: 'Notesgram',
        body: `Pencairan coin sebesar ${transaction.amount} ${
          transaction.status === PaymentStatus.SUCCESS
            ? 'telah berhasil'
            : 'gagal'
        }`,
      },
      'WITHDRAWAL',
      { creatorId: transaction.userId, withdrawalId: transaction.id },
    );

    console.log({ transaction });
  }
}
