import { Controller, Body, Post, Get } from '@nestjs/common';
import { Param, UseGuards } from '@nestjs/common/decorators';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { AdminGuard, JwtGuard } from '../auth/guard';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto';

@UseGuards(JwtGuard)
@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @UseGuards(AdminGuard)
  @Post('create')
  createChallenge(@Body() dto: CreateChallengeDto) {
    return this.challengeService.createChallenge(dto);
  }

  @Get()
  getChallenges(@GetUser('id') userId: number) {
    return this.challengeService.getChallenges(userId);
  }

  @Get(':id/claim')
  claimChallengeReward(
    @GetUser() user: User,
    @Param('id') challengeId: string,
  ) {
    return this.challengeService.claimChallengeReward(user, +challengeId);
  }
}
