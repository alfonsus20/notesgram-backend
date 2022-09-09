import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  async getPaymentInstruction(code: string) {
    try {
      const { data } = await this.httpService.axiosRef.get(
        `${this.config.get<string>('TRIPAY_ENDPOINT')}/payment/instruction`,
        {
          headers: {
            Authorization: `Bearer ${this.config.get<string>(
              'TRIPAY_API_KEY',
            )}`,
          },
          params: {
            code,
          },
        },
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'SUCCESS',
        data: data?.data || [],
      };
    } catch (error) {
      throw error;
    }
  }

  async getPaymentChannels() {
    try {
      const { data } = await this.httpService.axiosRef.get(
        `${this.config.get<string>(
          'TRIPAY_ENDPOINT',
        )}/merchant/payment-channel`,
        {
          headers: {
            Authorization: `Bearer ${this.config.get<string>(
              'TRIPAY_API_KEY',
            )}`,
          },
        },
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'SUCCESS',
        data: data?.data || [],
      };
    } catch (error) {
      throw error;
    }
  }
}
