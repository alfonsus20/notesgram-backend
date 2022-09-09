import { Controller, Get, Query } from '@nestjs/common';
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
}
