import { Controller, Get, Post, Query } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { PaymentCallbackDto } from './dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get('instruction')
  getPaymentInstruction(@Query('code') code: string) {
    return this.paymentService.getPaymentInstruction(code);
  }

  @Get('channel')
  getPaymentChannels() {
    return this.paymentService.getPaymentChannels();
  }

  @Post('callback')
  paymentCallback(@Body() dto: PaymentCallbackDto) {
    return this.paymentService.paymentCallback(dto);
  }

  @Post('create')
  createPayment(@GetUser() user: User) {
    return this.paymentService.createPayment();
  }
}
