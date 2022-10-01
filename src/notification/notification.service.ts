import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationCategory } from '@prisma/client';
import { NotificationData, NotificationInfo } from './types';

@Injectable()
export class NotificationService {
  constructor(
    private firebaseService: FirebaseService,
    private prisma: PrismaService,
  ) {}

  async sendNotifToSpecificUser(
    receiverId: number,
    info: NotificationInfo,
    type: NotificationCategory,
    data: NotificationData,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (user.fcm_token) {
      const notification = await this.prisma.notification.create({
        data: {
          title: info.title,
          body: info.body,
          category: type,
          receiverId,
          ...data,
        },
      });

      const firebaseResponse = await this.firebaseService.defaultApp
        .messaging()
        .sendToDevice(user.fcm_token, {
          notification: {
            ...info,
            icon: 'https://kcettakvwqchjfujgwao.supabase.co/storage/v1/object/public/images/favicon.png',
          },
          data: { data: JSON.stringify(notification) },
        });

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
    info: NotificationInfo,
    type: NotificationCategory,
    data: NotificationData,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        title: info.title,
        body: info.body,
        category: type,
        ...data,
      },
    });

    const userTokens = (
      await this.prisma.user.findMany({
        where: { fcm_token: { not: null } },
        select: { fcm_token: true },
      })
    ).map((token) => token.fcm_token);

    const firebaseResponse = await this.firebaseService.defaultApp
      .messaging()
      .sendMulticast({
        notification: { title: info.title, body: info.body },
        tokens: userTokens,
      });

    return {
      statusCode: HttpStatus.OK,
      message: 'Success send notification to all users',
      data: { notification, firebase_response: firebaseResponse },
    };
  }

  async getNotifications(receiverId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { OR: [{ receiverId }, { receiverId: null }] },
      include: {
        NotificationRead: true,
        creator: true,
        post: true,
        note: true,
        topup: true,
        withdrawal: true,
      },
    });

    const modified = notifications.map((notification) => {
      const structured = {
        ...notification,
        is_read: notification.NotificationRead.some(
          (notifRead) => notifRead.userId === receiverId,
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

  async markAsRead(receiverId: number, notifId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { OR: [{ receiverId }, { receiverId: null }], id: notifId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const notificationRead = await this.prisma.notificationRead.findFirst({
      where: { userId: receiverId, notificationId: notifId },
    });

    if (notificationRead) {
      throw new BadRequestException('Notification has already been read');
    }

    await this.prisma.notificationRead.create({
      data: { userId: receiverId, notificationId: notifId },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Notification was successfully read',
      data: null,
    };
  }
}
