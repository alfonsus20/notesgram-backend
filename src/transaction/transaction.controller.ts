import { Controller } from '@nestjs/common';
import { Get, UseGuards } from '@nestjs/common/decorators';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { TransactionService } from './transaction.service';

@UseGuards(JwtGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('history')
  getTransactionHistory(@GetUser('id') userId: number) {
    return this.transactionService.getTransactionHistory(userId);
  }
}
