import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({})],
  providers: [FirebaseStrategy],
})
export class AuthModule {}
