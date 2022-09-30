import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';
import { PaymentModule } from './payment/payment.module';
import { NoteModule } from './note/note.module';
import { PromoController } from './promo/promo.controller';
import { PromoService } from './promo/promo.service';
import { PromoModule } from './promo/promo.module';
import { NoteGroupController } from './note-group/note-group.controller';
import { NoteGroupService } from './note-group/note-group.service';
import { NoteGroupModule } from './note-group/note-group.module';
import { ChallengeModule } from './challenge/challenge.module';
import { ProfileModule } from './profile/profile.module';
import { NotificationModule } from './notification/notification.module';
import { FirebaseModule } from './firebase/firebase.module';
import { TransactionModule } from './transaction/transaction.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PostModule,
    StorageModule,
    UserModule,
    PaymentModule,
    NoteModule,
    PromoModule,
    NoteGroupModule,
    ChallengeModule,
    ProfileModule,
    NotificationModule,
    FirebaseModule,
    TransactionModule,
  ],
  controllers: [AppController, PromoController, NoteGroupController],
  providers: [AppService, PromoService, NoteGroupService],
})
export class AppModule {}
