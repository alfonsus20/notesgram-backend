import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseStrategy } from './strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [JwtModule.register({}), FirebaseModule, NotificationModule],
  providers: [FirebaseStrategy, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
