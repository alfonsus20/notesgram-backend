import { Injectable, HttpStatus } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { ChallengeCategory, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallengeDto } from './dto';

@Injectable()
export class ChallengeService {
  constructor(private readonly prismaService: PrismaService) {}

  async createChallenge(dto: CreateChallengeDto) {
    try {
      let endAt: Date | null = null;

      if (dto.period === 'DAILY') {
        endAt = new Date(Date.now() + 3600 * 1000 * 24);
      } else if (dto.period === 'WEEKLY') {
        endAt = new Date(Date.now() + 3600 * 1000 * 24 * 7);
      } else if (dto.period === 'MONTHLY') {
        endAt = new Date(Date.now() + 3600 * 1000 * 24 * 30);
      } else {
        throw new BadRequestException('Period is not available');
      }

      if (!(dto.category in ChallengeCategory)) {
        throw new BadRequestException('Category is not available');
      }

      const challenge = await this.prismaService.challenge.create({
        data: { ...dto, endAt },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success create challenge',
        data: challenge,
      };
    } catch (error) {
      throw error;
    }
  }

  async getChallenges(userId: number) {
    try {
      const challenges = await this.prismaService.challenge.findMany({
        where: { endAt: { gt: new Date() } },
        include: {
          ChallengeClaim: { where: { userId } },
        },
      });

      const noteSales = await this.prismaService.notePurchase.findMany({
        where: {
          note: { post: { userId } },
        },
      });

      const notePurchase = await this.prismaService.notePurchase.findMany({
        where: {
          userId,
        },
      });

      const likeGained = await this.prismaService.postLike.findMany({
        where: { post: { userId } },
      });

      const likeGiven = await this.prismaService.postLike.findMany({
        where: { likerId: userId },
      });

      const commentGained = await this.prismaService.postComment.findMany({
        where: { post: { userId } },
      });

      const commentGiven = await this.prismaService.postComment.findMany({
        where: { commenterId: userId },
      });

      const modified = challenges.map((challenge) => {
        if (challenge.category === 'NOTE_SALE') {
          const currentProgress = noteSales.filter(
            (sale) => new Date(sale.createdAt) >= new Date(challenge.createdAt),
          ).length;
          return {
            ...challenge,
            current_progress: currentProgress,
            can_claim:
              challenge.ChallengeClaim.length === 0 &&
              currentProgress >= challenge.count,
          };
        } else if (challenge.category === 'NOTE_PURCHASE') {
          const currentProgress = notePurchase.filter(
            (purchase) =>
              new Date(purchase.createdAt) >= new Date(challenge.createdAt),
          ).length;
          return {
            ...challenge,
            current_progress: currentProgress,
            can_claim:
              challenge.ChallengeClaim.length === 0 &&
              currentProgress >= challenge.count,
          };
        } else if (challenge.category === 'LIKE_GAINED') {
          const currentProgress = likeGained.filter(
            (like) => new Date(like.createdAt) >= new Date(challenge.createdAt),
          ).length;
          return {
            ...challenge,
            current_progress: currentProgress,
            can_claim:
              challenge.ChallengeClaim.length === 0 &&
              currentProgress >= challenge.count,
          };
        } else if (challenge.category === 'LIKE_GIVEN') {
          const currentProgress = likeGiven.filter(
            (like) => new Date(like.createdAt) >= new Date(challenge.createdAt),
          ).length;
          return {
            ...challenge,
            current_progress: currentProgress,
            can_claim:
              challenge.ChallengeClaim.length === 0 &&
              currentProgress >= challenge.count,
          };
        } else if (challenge.category === 'COMMENT_GAINED') {
          const currentProgress = commentGained.filter(
            (comment) =>
              new Date(comment.createdAt) >= new Date(challenge.createdAt),
          ).length;
          return {
            ...challenge,
            current_progress: currentProgress,
            can_claim:
              challenge.ChallengeClaim.length === 0 &&
              currentProgress >= challenge.count,
          };
        } else {
          const currentProgress = commentGiven.filter(
            (comment) =>
              new Date(comment.createdAt) >= new Date(challenge.createdAt),
          ).length;
          return {
            ...challenge,
            current_progress: currentProgress,
            can_claim:
              challenge.ChallengeClaim.length === 0 &&
              currentProgress >= challenge.count,
          };
        }
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get all challenges and progress',
        data: modified,
      };
    } catch (error) {
      throw error;
    }
  }

  async claimChallengeReward(user: User, challengeId: number) {
    try {
      const challenge = await this.prismaService.challenge.findUnique({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new NotFoundException('Challenge not found');
      }

      if (new Date() > new Date(challenge.endAt)) {
        throw new BadRequestException('Challenge has already expired');
      }

      const challengeClaim = await this.prismaService.challengeClaim.findFirst({
        where: { userId: user.id, challengeId },
      });

      if (challengeClaim) {
        throw new BadRequestException('Reward has already been claimed');
      }

      const data = await this.prismaService.$transaction(async (trans) => {
        const newChallengeClaim = await trans.challengeClaim.create({
          data: { userId: user.id, challengeId },
          include: { challenge: true },
        });

        await trans.user.update({
          where: { id: user.id },
          data: { coins: user.coins + newChallengeClaim.challenge.reward },
        });

        return newChallengeClaim;
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success claim challenge reward',
        data,
      };
    } catch (error) {
      throw error;
    }
  }
}
