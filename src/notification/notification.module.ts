import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Global()
@Module({
  imports: [FirebaseModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
