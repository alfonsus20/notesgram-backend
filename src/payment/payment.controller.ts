import { Controller, Post } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import {
  PaymentCallbackDto,
  TopupCoinDto,
  WithdrawCallbackDto,
  WithdrawDto,
} from './dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtGuard)
  @Post('topup-coin')
  topupCoin(@GetUser() user: User, @Body() dto: TopupCoinDto) {
    return this.paymentService.topupCoin(user, dto);
  }

  @Post('topup-coin/callback')
  async paymentCallback(@Body() dto: PaymentCallbackDto) {
    this.paymentService.handleCallbackTopupCoin(dto);
  }

  @UseGuards(JwtGuard)
  @Post('withdraw')
  withDrawMoney(@GetUser() user: User, @Body() dto: WithdrawDto) {
    return this.paymentService.withDrawMoney(user, dto);
  }

  @Post('withdraw/callback')
  async withdrawalCallback(@Body() dto: WithdrawCallbackDto) {
    this.paymentService.handleCallbackWithdrawal(dto);
  }
}
