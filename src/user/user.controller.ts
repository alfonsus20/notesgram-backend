import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserService } from './user.service';
import { CreateUsernameDto } from './dto';
import { Param } from '@nestjs/common/decorators';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me/profile')
  getMyProfile(@GetUser('id') userId: number) {
    return this.userService.getMyProfile(userId);
  }

  @Get(':userId/followers')
  getUserFollowers(@Param('userId') userId: string) {
    return this.userService.getUserFollowers(+userId);
  }

  @Get(':userId/followings')
  getUserFollowings(@Param('userId') userId: string) {
    return this.userService.getUserFollowings(+userId);
  }

  @Get(':userId/notes')
  getUserNotes(@Param('userId') userId: string) {
    return this.userService.getUserNotes(+userId);
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

  @Get(':id/follow')
  followUser(
    @GetUser('id') followerId: number,
    @Param('id') followingId: number,
  ) {
    return this.userService.followUser(followerId, +followingId);
  }
}
