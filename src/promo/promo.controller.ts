import { Controller, Query, Get, UseGuards } from '@nestjs/common';
import { PromoService } from './promo.service';

import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('promo')
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Get()
  validatePromoCode(@Query('code') code: string) {
    return this.promoService.validatePromoCode(code);
  }
}
