import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { FirebaseGuard } from '../auth/guard';
import { NotificationService } from './notification.service';

@UseGuards(FirebaseGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(@GetUser('id') userId: number) {
    return this.notificationService.getNotifications(userId);
  }
}
