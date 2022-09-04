import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserService } from './user.service';
import { CreateUsernameDto } from './dto';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile/me')
  getMyProfile(@GetUser() user: User) {
    return this.userService.getMyProfile(user);
  }

  @Get('username/check')
  checkUsername(@Query('username') username: string) {
    return this.userService.checkUsername(username);
  }

  @Post('username/create')
  createUsername(
    @GetUser('id') userId: number,
    @Body() dto: CreateUsernameDto,
  ) {
    return this.userService.createUsername(userId, dto);
  }
}