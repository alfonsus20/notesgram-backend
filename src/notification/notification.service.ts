import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as firebase from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationCategory } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private firebaseService: FirebaseService,
    private prisma: PrismaService,
  ) {}

  async sendNotifToSpecificUser(
    userId: number,
    message: firebase.messaging.MessagingPayload,
    type: NotificationCategory,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user.fcm_token) {
      const notification = await this.prisma.notification.create({
        data: {
          title: message.notification.title,
          body: message.notification.body,
          category: type,
          userId,
        },
      });

      message.notification.icon =
        'https://kcettakvwqchjfujgwao.supabase.co/storage/v1/object/public/images/favicon.png';

      const firebaseResponse = await this.firebaseService.defaultApp
        .messaging()
        .sendToDevice(user.fcm_token, message);

      return {
        statusCode: HttpStatus.OK,
        message: 'Success send notification to specific user',
        data: { notification, firebase_response: firebaseResponse },
      };
    } else {
      throw new BadRequestException('FCM token is required');
    }
  }

  async sendGlobalNotif(
    message: firebase.messaging.Message,
    type: NotificationCategory,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        title: message.notification.title,
        body: message.notification.body,
        category: type,
      },
    });

    message.android.notification.icon =
      'https://kcettakvwqchjfujgwao.supabase.co/storage/v1/object/public/images/favicon.png';

    await this.firebaseService.defaultApp.messaging().send(message);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success send notification to all users',
      data: notification,
    };
  }

  async getNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      include: { NotificationRead: true },
    });

    const modified = notifications.map((notification) => {
      const structured = {
        ...notification,
        is_read: notification.NotificationRead.some(
          (notifRead) => notifRead.userId === userId,
        ),
      };

      delete structured.NotificationRead;

      return structured;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Success get all notifications',
      data: modified,
    };
  }

  async markAsRead(userId: number, notifId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { OR: [{ userId }, { userId: null }], id: notifId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const notificationRead = await this.prisma.notificationRead.findFirst({
      where: { userId, notificationId: notifId },
    });

    if (notificationRead) {
      throw new BadRequestException('Notification has already been read');
    }

    await this.prisma.notificationRead.create({
      data: { userId, notificationId: notifId },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Notification was successfully read',
      data: null,
    };
  }
}
