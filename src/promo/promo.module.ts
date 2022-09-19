import { Module } from '@nestjs/common';
import { PromoController } from './promo.controller';
import { PromoService } from './promo.service';

@Module({
  providers: [PromoService],
  controllers: [PromoController],
})
export class PromoModule {}
