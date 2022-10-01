import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoDto } from './dto';

@Injectable()
export class PromoService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAllPromoCodes() {
    try {
      const promoCodes = await this.prismaService.promoCode.findMany({
        where: { endAt: { gt: new Date() } },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get available promo code',
        data: promoCodes,
      };
    } catch (error) {
      throw error;
    }
  }

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
        data: { is_valid: true, promo },
        message: 'Promo is valid',
      };
    } catch (error) {
      throw error;
    }
  }

  async createPromoCode(dto: CreatePromoDto) {
    try {
      const promo = await this.prismaService.promoCode.create({ data: dto });

      await this.notificationService.sendGlobalNotif(
        {
          title: 'Notesgram',
          body: `Segera pakai kode promo ${promo.code} untuk membeli catatan yang Anda inginkan`,
        },
        'PROMO',
        { promoId: promo.id },
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success create promo code',
        data: promo,
      };
    } catch (error) {
      throw error;
    }
  }
}
