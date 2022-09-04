import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('profile/me')
  getMyProfile(@GetUser() user: User) {
    return this.userService.getMyProfile(user);
  }

  @UseGuards(JwtGuard)
  @Get('check-username')
  checkUsername(@Query('username') username: string) {
    return this.userService.checkUsername(username);
  }
}
