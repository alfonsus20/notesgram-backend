import { Controller, Get, Post, Query } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { PaymentCallbackDto, TopupCoinDto } from './dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('callback')
  async paymentCallback(@Body() dto: PaymentCallbackDto) {
    this.paymentService.handleCallbackTopupCoin(dto);
  }

  @UseGuards(JwtGuard)
  @Post('topup-coin')
  topupCoin(@GetUser() user: User, @Body() dto: TopupCoinDto) {
    return this.paymentService.topupCoin(user, dto);
  }
}
