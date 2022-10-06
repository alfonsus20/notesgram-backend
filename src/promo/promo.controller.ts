import { Controller, Query, Get, UseGuards, Post, Body } from '@nestjs/common';
import { AdminGuard, JwtGuard } from '../auth/guard';
import { CreatePromoDto } from './dto';
import { PromoService } from './promo.service';

@UseGuards(JwtGuard)
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

  @UseGuards(AdminGuard)
  @Post('create')
  createPromoCode(@Body() dto: CreatePromoDto) {
    return this.promoService.createPromoCode(dto);
  }
}
