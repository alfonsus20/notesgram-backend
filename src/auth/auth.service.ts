import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(private notificationService: NotificationService) {}

  async sendLoginNotif(userId: number) {
    return this.notificationService.sendNotifToSpecificUser(
      userId,
      {
        notification: {
          title: 'Notifikasi Keamanan',
          body: 'Kami menemukan adanya login baru ke akun Anda di perangkat lain. Jika ini memang Anda, Anda tidak perlu melakukan apa-apa. Jika bukan, kami akan membantu untuk mengamankan akun Anda.',
        },
      },
      'INFO',
    );
  }
}
