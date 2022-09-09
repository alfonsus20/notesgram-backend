import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentCallbackDto } from './dto';
@Injectable()
export class PaymentService {
  private tripayApiKey: string;
  private tripayEndpoint: string;
  private tripayMerchantCode: string;
  private tripayPrivateKey: string;

  constructor(private httpService: HttpService, private config: ConfigService) {
    this.tripayEndpoint = this.config.get<string>('TRIPAY_ENDPOINT');
    this.tripayApiKey = this.config.get<string>('TRIPAY_API_KEY');
    this.tripayMerchantCode = this.config.get<string>('TRIPAY_MERCHANT_CODE');
    this.tripayPrivateKey = this.config.get<string>('TRIPAY_PRIVATE_KEY');
  }

  async getPaymentInstruction(code: string) {
    try {
      const { data } = await this.httpService.axiosRef.get(
        `${this.config.get<string>('TRIPAY_ENDPOINT')}/payment/instruction`,
        {
          headers: {
            Authorization: `Bearer ${this.tripayApiKey}`,
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
        `${this.tripayEndpoint}/merchant/payment-channel`,
        {
          headers: {
            Authorization: `Bearer ${this.tripayApiKey}`,
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

  async createPayment() {
    try {
      const { createHmac } = await import('crypto');

      const signature = createHmac('sha256', this.tripayPrivateKey)
        .update(this.tripayMerchantCode + 'INV001' + 100000)
        .digest('hex');

      const { data } = await this.httpService.axiosRef.post(
        `${this.tripayEndpoint}/transaction/create`,
        {
          method: 'BRIVA',
          merchant_ref: 'INV001',
          amount: 100000,
          customer_name: 'Alfons',
          customer_email: 'alfons@gmail.com',
          order_items: [{ name: 'test buku', price: 9000, quantity: 1 }],
          signature,
        },
        {
          headers: {
            Authorization: `Bearer ${this.tripayApiKey}`,
          },
        },
      );

      return { statusCode: HttpStatus.OK, message: 'SUCCESS', data };
    } catch (error) {
      console.log(error.response.data);
      throw error;
    }
  }

  async paymentCallback(dto: PaymentCallbackDto) {
    console.log({ dto });

    return { success: true };
  }
}
