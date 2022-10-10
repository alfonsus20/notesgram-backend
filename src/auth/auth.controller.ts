import { Controller } from '@nestjs/common';
import { Body, Post, UseGuards } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { LoginDto, RegisterDto } from './dto';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  logout(@GetUser('id') userId: number) {
    return this.authService.logout(userId);
  }
}
