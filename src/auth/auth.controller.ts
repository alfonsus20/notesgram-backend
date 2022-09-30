import { Controller } from '@nestjs/common';
import { Get, UseGuards } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { FirebaseGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(FirebaseGuard)
  @Get('send-notification')
  sendLoginNotif(@GetUser('id') userId: number) {
    return this.authService.sendLoginNotif(userId);
  }
}
