import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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

  @Get('/:id/read')
  markAsRead(@GetUser('id') userId: number, @Param('id') notifId: string) {
    return this.notificationService.markAsRead(userId, +notifId);
  }
}
