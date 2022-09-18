import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentCallbackDto } from './dto';
import { TopupCoinDto } from './dto/topup-coin.dto';
import { PaymentStatus } from './enum';
@Injectable()
export class PaymentService {
  private oyBaseURL: string;
  private headers: { 'X-Api-Key': string; 'X-Oy-Username': string };

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
    private prismaService: PrismaService,
  ) {
    this.oyBaseURL = this.config.get<string>('OY_BASE_URL');
    this.headers = {
      'X-Api-Key': this.config.get<string>('OY_API_KEY'),
      'X-Oy-Username': this.config.get<string>('OY_USERNAME'),
    };
  }

  async handleCallback(dto: PaymentCallbackDto) {
    let status = '';

    if (dto.status === 'success') {
      status = PaymentStatus.SUCCESS;
    } else if (dto.status === 'processing') {
      status = PaymentStatus.WAITING;
    } else {
      status = PaymentStatus.FAILED;
    }

    // kirim notif

    const transaction = await this.prismaService.topupTransactions.update({
      where: { id: dto.partner_tx_id },
      data: { status, payment_method: dto.payment_method },
    });

    console.log({ transaction });
  }

  async topupCoin(user: User, dto: TopupCoinDto) {
    const transaction = await this.prismaService.topupTransactions.create({
      data: {
        amount: dto.amount,
        userId: user.id,
        status: PaymentStatus.WAITING,
      },
    });

    const { data } = await this.httpService.axiosRef.post(
      `${this.oyBaseURL}/payment-checkout/create-v2`,
      {
        sender_name: user.name,
        amount: dto.amount,
        email: user.email,
        is_open: false,
        include_admin_fee: true,
        list_disabled_payment_methods: 'CREDIT_CARD',
        va_display_name: 'Notesgram Coin Topup',
        partner_tx_id: transaction.id,
      },
      { headers: this.headers },
    );

    return {
      message: 'Success create topup coin transaction',
      statusCode: HttpStatus.OK,
      data: { payment: data },
    };
  }
}
