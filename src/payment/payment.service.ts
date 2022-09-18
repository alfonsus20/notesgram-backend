import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PaymentCallbackDto } from './dto';
import { TopupCoinDto } from './dto/topup-coin.dto';
@Injectable()
export class PaymentService {
  private oyBaseURL: string;
  private headers: { 'X-Api-Key': string; 'X-Oy-Username': string };

  constructor(private httpService: HttpService, private config: ConfigService) {
    this.oyBaseURL = this.config.get<string>('OY_BASE_URL');
    this.headers = {
      'X-Api-Key': this.config.get<string>('OY_API_KEY'),
      'X-Oy-Username': this.config.get<string>('OY_USERNAME'),
    };
  }

  async topupCoin(user: User, dto: TopupCoinDto) {
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
      },
      { headers: this.headers },
    );
    return {
      message: 'Success create topup coin transaction',
      data: { payment: data },
    };
  }
}
