import { Controller, Query, Get, UseGuards } from '@nestjs/common';
import { FirebaseGuard } from '../auth/guard';
import { PromoService } from './promo.service';

@UseGuards(FirebaseGuard)
@Controller('promo')
export class PromoController {
  constructor(private promoService: PromoService) {}
  @Get()
  getAllPromoCodes() {
    return this.promoService.getAllPromoCodes();
  }

  @Get('validate')
  validatePromoCode(@Query('code') code: string) {
    return this.promoService.validatePromoCode(code);
  }
}
