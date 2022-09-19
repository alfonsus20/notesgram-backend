import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoService {
  constructor(private prismaService: PrismaService) {}

  async validatePromoCode(code: string) {
    if (!code) {
      throw new BadRequestException('Promo code is required');
    }

    try {
      const promo = await this.prismaService.promoCode.findUnique({
        where: { code },
      });

      if (!promo) {
        throw new NotFoundException('Promo code not found');
      }

      if (new Date() > new Date(promo.endAt)) {
        throw new BadRequestException('Promo has expired');
      }

      return {
        statusCode: HttpStatus.OK,
        data: { is_valid: true },
        message: 'Promo is valid',
      };
    } catch (error) {
      throw error;
    }
  }
}
