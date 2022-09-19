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
  ],
  controllers: [AppController, PromoController],
  providers: [AppService, PromoService],
})
export class AppModule {}
